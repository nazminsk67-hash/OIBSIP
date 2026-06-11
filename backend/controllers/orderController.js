import Razorpay   from 'razorpay'
import Order      from '../models/Order.js'
import Coupon     from '../models/Coupon.js'
import RewardTransaction from '../models/RewardTransaction.js'
import Settings   from '../models/Settings.js'
import { ORDER_STATUS } from '../models/Order.js'
import { verifyRazorpaySignature } from '../utils/razorpayVerify.js'
import { emitOrderPlaced, emitOrderDelivered } from '../utils/socket.js'
import {
  sendOrderConfirmationTemplate,
  sendOrderDeliveredTemplate,
  sendOrderDispatchedTemplate,
  sendCouponReceivedTemplate,
  sendRewardUnlockedTemplate,
} from '../services/EmailTemplateService.js'
import { recordAudit } from '../services/AuditLogService.js'
import {
  logPaymentInitiated,
  logOrderPlacedPaid,
  logOrderPlacedPending,
  logPaymentFailure,
  logVerificationFailure,
} from '../services/PaymentAuditService.js'
import {
  processCatalogOrderStock,
  processBuilderOrderStock,
} from '../services/InventoryAutomationService.js'
import {
  notifyAdminNewOrder,
  handleOrderStatusNotification,
} from '../services/NotificationService.js'
import { getTierForUser } from '../services/LoyaltyTierService.js'

// ── Lazy-load Razorpay to prevent errors if credentials are missing ─
let razorpayInstance = null

const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
      )
    }
    razorpayInstance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayInstance
}

// ── POST /api/orders/create-payment ──────────────────────────────
// Creates a Razorpay order; frontend uses the returned order_id to open checkout.
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body   // in paise (INR * 100)
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    const razorpay = getRazorpay()
    const razorpayOrder = await razorpay.orders.create({
      amount:   Math.round(amount),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    })

    await logPaymentInitiated({
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount / 100,
      currency: razorpayOrder.currency,
      message: 'Razorpay order created for checkout',
      ipAddress: req.ip,
    })

    res.json({
      orderId:  razorpayOrder.id,
      amount:   razorpayOrder.amount,
      currency: razorpayOrder.currency,
    })
  } catch (err) { next(err) }
}

// ── POST /api/orders/place ────────────────────────────────────────
// Called after Razorpay payment success (test mode: always succeeds).
export const placeOrder = async (req, res, next) => {
  try {
    const {
      pizzas = [],
      base, sauce, cheese, veggies = [], quantity = 1,
      address, phone, paymentMethod = 'cash',
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      couponCode,
      rewardPointsUsed = 0,
    } = req.body

    if (!address || !phone) {
      return res.status(400).json({ message: 'Address and phone are required' })
    }

    const buildItems = () => {
      if (pizzas.length) return pizzas
      if (!base || !sauce || !cheese) return null
      return [
        {
          pizza: null,
          name: 'Custom pizza',
          size: 'Custom',
          sizePrice: (base.price || 0) + (sauce.price || 0) + (cheese.price || 0) + (veggies || []).reduce((sum, v) => sum + (v.price || 0), 0),
          toppings: [],
          quantity: quantity || 1,
        },
      ]
    }

    const items = buildItems()
    if (!items) {
      return res.status(400).json({ message: 'Base, sauce, and cheese are required' })
    }

    const subtotal = items.reduce((sum, item) => {
      const toppingsTotal = (item.toppings || []).reduce((acc, topping) => acc + (topping.extraPrice || 0), 0)
      return sum + (((item.sizePrice || 0) + toppingsTotal) * (item.quantity || 1))
    }, 0)

    if (subtotal <= 0) {
      return res.status(400).json({ message: 'Invalid order subtotal' })
    }

    let coupon = null
    let couponDiscount = 0

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toString().trim().toUpperCase() })
      if (!coupon || !coupon.active) {
        return res.status(400).json({ message: 'Coupon is not valid or inactive' })
      }
      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        return res.status(400).json({ message: 'Coupon has expired' })
      }
      if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit has been reached' })
      }
      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Order must be at least ₹${coupon.minOrderAmount.toFixed(2)} to use this coupon` })
      }

      const userUsage = coupon.usageHistory.filter((history) =>
        history.user?.toString() === req.user._id.toString()
      ).length
      if (coupon.perUserLimit > 0 && userUsage >= coupon.perUserLimit) {
        return res.status(400).json({ message: 'Coupon may only be used once per user' })
      }

      couponDiscount = coupon.type === 'percentage'
        ? Math.min((coupon.value / 100) * subtotal, coupon.maxDiscount || subtotal)
        : Math.min(coupon.value, coupon.maxDiscount > 0 ? coupon.maxDiscount : coupon.value)
      couponDiscount = Math.max(0, Math.round(couponDiscount * 100) / 100)
    }

    const settings = await Settings.findOne() || {}
    const rewardSettings = settings.rewards || {
      enabled: true,
      pointsPerRupee: 1,
      redemptionValuePerPoint: 0.5,
      minRedeemPoints: 10,
      maxRedeemPercentage: 20,
    }

    let rewardDiscount = 0
    let pointsRedeemed = 0

    if (rewardPointsUsed > 0) {
      if (!rewardSettings.enabled) {
        return res.status(400).json({ message: 'Reward redemption is currently disabled' })
      }
      if (rewardPointsUsed > req.user.rewardPoints) {
        return res.status(400).json({ message: 'Insufficient reward points' })
      }
      if (rewardPointsUsed < rewardSettings.minRedeemPoints) {
        return res.status(400).json({ message: `You must redeem at least ${rewardSettings.minRedeemPoints} points` })
      }

      const requestedDiscount = rewardPointsUsed * rewardSettings.redemptionValuePerPoint
      const maxRedeemable = Math.max(0, subtotal * (rewardSettings.maxRedeemPercentage / 100))
      if (requestedDiscount > maxRedeemable) {
        return res.status(400).json({ message: `Reward redemption cannot exceed ₹${maxRedeemable.toFixed(2)} for this order` })
      }

      rewardDiscount = Math.max(0, Math.round(requestedDiscount * 100) / 100)
      pointsRedeemed = rewardPointsUsed
    }

    const finalPrice = Math.max(0, subtotal - couponDiscount - rewardDiscount)
    const earnedRewardPoints = rewardSettings.enabled
      ? Math.max(0, Math.floor(subtotal * (rewardSettings.pointsPerRupee || 1)))
      : 0

    const isOnlinePayment = paymentMethod === 'online' || Boolean(razorpayPaymentId)
    let paymentStatus = 'pending'
    let paymentVerified = false

    if (isOnlinePayment) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        await logVerificationFailure({
          user: req.user._id,
          razorpayOrderId,
          razorpayPaymentId,
          message: 'Online payment missing verification fields',
          ipAddress: req.ip,
        })
        return res.status(400).json({
          message: 'Online payments require razorpayOrderId, razorpayPaymentId, and razorpaySignature. Verify payment before placing order.',
        })
      }

      paymentVerified = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      )

      if (!paymentVerified) {
        await logPaymentFailure({
          user: req.user._id,
          razorpayOrderId,
          razorpayPaymentId,
          amount: finalPrice,
          message: 'Signature verification failed at place order',
          ipAddress: req.ip,
        })
        return res.status(400).json({
          message: 'Payment verification failed. Your order was not placed and payment was not marked as paid.',
        })
      }

      paymentStatus = 'paid'
    } else if (razorpayPaymentId) {
      // Legacy clients sending payment id without signature — reject (never mark paid unverified)
      return res.status(400).json({
        message: 'Payment signature required. Please update the app and complete checkout again.',
      })
    }

    const orderData = {
      user: req.user._id,
      address,
      phone,
      paymentMethod,
      subtotalPrice: subtotal,
      coupon: coupon?._id,
      couponCode: coupon?.code,
      couponDiscount,
      rewardPointsUsed: pointsRedeemed,
      rewardDiscount,
      earnedRewardPoints,
      totalPrice: finalPrice,
      payment: {
        razorpayOrderId:   razorpayOrderId || undefined,
        razorpayPaymentId: razorpayPaymentId || undefined,
        razorpaySignature: razorpaySignature || undefined,
        transactionId:     razorpayPaymentId || undefined,
        verifiedAt:        paymentVerified ? new Date() : undefined,
        status:            paymentStatus,
      },
      status: ORDER_STATUS.RECEIVED,
      statusHistory: [{
        status: ORDER_STATUS.RECEIVED,
        note: 'Order placed',
        updatedAt: new Date(),
        updatedBy: req.user._id,
      }],
      lastStatusUpdateAt: new Date(),
    }

    if (pizzas.length) {
      orderData.pizzas = pizzas
    } else {
      orderData.base = base
      orderData.sauce = sauce
      orderData.cheese = cheese
      orderData.veggies = veggies
      orderData.quantity = quantity
    }

    const order = await Order.create(orderData)

    if (coupon && couponDiscount > 0) {
      coupon.usageCount += 1
      coupon.usageHistory.push({
        user: req.user._id,
        order: order._id,
        discountApplied: couponDiscount,
      })
      await coupon.save()
    }

    if (pointsRedeemed > 0) {
      req.user.rewardPoints = Math.max(0, req.user.rewardPoints - pointsRedeemed)
      await req.user.save({ validateBeforeSave: false })
      await RewardTransaction.create({
        user: req.user._id,
        type: 'redeem',
        points: pointsRedeemed,
        amount: rewardDiscount,
        order: order._id,
        description: `Redeemed ${pointsRedeemed} points for ₹${rewardDiscount.toFixed(2)}`,
      })
    }

    if (earnedRewardPoints > 0) {
      req.user.rewardPoints = (req.user.rewardPoints || 0) + earnedRewardPoints
      await req.user.save({ validateBeforeSave: false })
      await RewardTransaction.create({
        user: req.user._id,
        type: 'earn',
        points: earnedRewardPoints,
        amount: subtotal,
        order: order._id,
        description: `Earned ${earnedRewardPoints} points from order payment`,
      })
    }

    if (orderData.pizzas && orderData.pizzas.length) {
      await processCatalogOrderStock(orderData.pizzas)
    } else {
      await processBuilderOrderStock({ base, sauce, cheese, veggies, quantity })
    }

    const previousTier = getTierForUser(req.user.totalOrders || 0, req.user.totalSpent || 0)
    req.user.totalOrders = (req.user.totalOrders || 0) + 1
    req.user.totalSpent = (req.user.totalSpent || 0) + finalPrice
    await req.user.save({ validateBeforeSave: false })

    const newTier = getTierForUser(req.user.totalOrders, req.user.totalSpent)
    if (newTier.id !== previousTier.id) {
      sendRewardUnlockedTemplate(req.user, newTier.name, req.user.rewardPoints).catch(() => {})
    }

    if (paymentStatus === 'paid') {
      await logOrderPlacedPaid({
        user: req.user._id,
        order: order._id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: finalPrice,
        message: 'Order placed after verified payment',
      })
    } else {
      await logOrderPlacedPending({
        user: req.user._id,
        order: order._id,
        amount: finalPrice,
        message: 'Order placed with pending payment',
      })
    }

    sendOrderConfirmationTemplate(req.user, order).catch(() => {})
    if (coupon && couponDiscount > 0) {
      sendCouponReceivedTemplate(req.user, coupon, couponDiscount).catch(() => {})
    }

    notifyAdminNewOrder(order, req.user.name).catch(() => {})
    emitOrderPlaced(order, req.user.name)
    handleOrderStatusNotification(req.user._id, order, ORDER_STATUS.RECEIVED).catch(() => {})

    res.status(201).json(order)
  } catch (err) { next(err) }
}

// ── GET /api/orders/my-orders ─────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, orders: orders || [], count: orders.length })
  } catch (err) {
    console.error('getMyOrders error:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch your orders' })
  }
}

// ── GET /api/orders/:id ───────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Non-admins can only view their own orders
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({ success: true, order })
  } catch (err) {
    console.error('getOrderById error:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch order' })
  }
}

// ── GET /api/orders  (admin) ──────────────────────────────────────
export const getAllOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      orders: orders || [],
      count: orders.length,
    })
  } catch (err) {
    console.error('getAllOrders error:', err.message)
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders',
    })
  }
}

// ── PATCH /api/orders/:id/status  (admin) ────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' })
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    order.status = status
    order.lastStatusUpdateAt = new Date()
    if (!order.statusHistory) order.statusHistory = []
    order.statusHistory.push({
      status,
      note: `Updated by admin`,
      updatedAt: new Date(),
      updatedBy: req.user._id,
    })
    await order.save()

    await handleOrderStatusNotification(order.user._id, order, status)

    await recordAudit({
      adminId: req.user._id,
      action: 'Order status changed',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: { status },
    })

    if (status === ORDER_STATUS.DELIVERY) {
      sendOrderDispatchedTemplate(order.user, order).catch(() => {})
    }
    if (status === ORDER_STATUS.DELIVERED) {
      sendOrderDeliveredTemplate(order.user, order).catch(() => {})
      emitOrderDelivered(order.user._id, order._id)
    }

    res.json({ success: true, order })
  } catch (err) {
    console.error('updateOrderStatus error:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Failed to update order status' })
  }
}
