import Razorpay   from 'razorpay'
import Order      from '../models/Order.js'
import Ingredient from '../models/Ingredient.js'
import { ORDER_STATUS } from '../models/Order.js'
import { emitOrderStatusUpdate } from '../utils/socket.js'
import { sendLowStockAlert }     from '../utils/email.js'

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
      base, sauce, cheese, veggies = [], quantity = 1,
      pizzas = [],
      totalPrice,
      razorpayOrderId, razorpayPaymentId,
    } = req.body

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid total price' })
    }

    // Create the order object data
    const orderData = {
      user: req.user._id,
      totalPrice,
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        status: razorpayPaymentId ? 'paid' : 'pending',
      },
      status: ORDER_STATUS.RECEIVED,
    }

    // Attach either catalog pizzas or builder fields
    if (pizzas && pizzas.length) orderData.pizzas = pizzas
    else {
      if (!base || !sauce || !cheese) {
        return res.status(400).json({ message: 'Base, sauce, and cheese are required' })
      }
      orderData.base = base
      orderData.sauce = sauce
      orderData.cheese = cheese
      orderData.veggies = veggies
      orderData.quantity = quantity
    }

    // Create the order
    const order = await Order.create(orderData)

    // ── Deduct stock for involved ingredients ─────────────────────
    let ingredientIds = []

    if (orderData.pizzas && orderData.pizzas.length) {
      // collect ingredient ids from pizzas toppings and pizza inventoryIngredients
      for (const p of orderData.pizzas) {
        if (Array.isArray(p.toppings)) {
          ingredientIds.push(...p.toppings.map(t => t.ingredientId).filter(Boolean))
        }
        if (p.pizza) {
          // try to load pizza to read its inventoryIngredients
          try {
            // lazy require to avoid circular deps
            const Pizza = (await import('../models/Pizza.js')).default
            const pizzaDoc = await Pizza.findById(p.pizza)
            if (pizzaDoc && pizzaDoc.inventoryIngredients && pizzaDoc.inventoryIngredients.length) {
              ingredientIds.push(...pizzaDoc.inventoryIngredients.map(id => id.toString()))
            }
          } catch (e) {
            // ignore
          }
        }
      }
      // multiply by quantities
      // we'll decrement each ingredient by the sum of pizza quantities
      const qtyMap = {}
      for (const p of orderData.pizzas) {
        const q = p.quantity || 1
        if (p.toppings) {
          for (const t of p.toppings) {
            if (!t.ingredientId) continue
            qtyMap[t.ingredientId] = (qtyMap[t.ingredientId] || 0) + q
          }
        }
      }
      const ids = Object.keys(qtyMap)
      const ingredients = await Ingredient.find({ _id: { $in: ids } })
      for (const ing of ingredients) {
        const dec = qtyMap[ing._id.toString()] || 0
        ing.stock = Math.max(0, ing.stock - dec)
        await ing.save()
        if (ing.stock < ing.alertThreshold) {
          sendLowStockAlert(ing).catch(err => console.error('Low-stock email error:', err.message))
        }
      }
    } else {
      ingredientIds = [
        base?.ingredientId,
        sauce?.ingredientId,
        cheese?.ingredientId,
        ...veggies.map(v => v.ingredientId),
      ].filter(Boolean)

      const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } })

      for (const ing of ingredients) {
        ing.stock = Math.max(0, ing.stock - quantity)
        await ing.save()

        // Alert if below threshold
        if (ing.stock < ing.alertThreshold) {
          sendLowStockAlert(ing).catch(err =>
            console.error('Low-stock email error:', err.message)
          )
        }
      }
    }

    res.status(201).json(order)
  } catch (err) { next(err) }
}

// ── GET /api/orders/my-orders ─────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { next(err) }
}

// ── GET /api/orders/:id ───────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Non-admins can only view their own orders
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(order)
  } catch (err) { next(err) }
}

// ── GET /api/orders  (admin) ──────────────────────────────────────
export const getAllOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { next(err) }
}

// ── PATCH /api/orders/:id/status  (admin) ────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')

    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Emit real-time update to the order owner via socket
    emitOrderStatusUpdate(order.user._id, order._id.toString(), status)

    res.json(order)
  } catch (err) { next(err) }
}
