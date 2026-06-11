import Notification from '../models/Notification.js'
import { ORDER_STATUS } from '../models/Order.js'
import {
  emitToUser,
  emitToAdmins,
  emitOrderStatusUpdate,
} from '../utils/socket.js'

const create = async ({ user, audience = 'user', type, title, message, emoji, data }) => {
  const doc = await Notification.create({
    user: user || null,
    audience,
    type,
    title,
    message,
    emoji: emoji || '🔔',
    data,
  })

  const payload = {
    id: doc._id.toString(),
    audience: doc.audience,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    emoji: doc.emoji,
    data: doc.data,
    createdAt: doc.createdAt,
  }

  if (audience === 'admin') {
    emitToAdmins('notification', payload)
    emitToAdmins('adminAlert', { title, message, ...payload })
  } else if (user) {
    emitToUser(user, 'notification', payload)
  }

  return doc
}

// ── Customer notifications ────────────────────────────────────────

export const notifyOrderConfirmed = (userId, order) =>
  create({
    user: userId,
    type: 'order',
    emoji: '✅',
    title: 'Order confirmed',
    message: `Your order #${order._id.toString().slice(-8).toUpperCase()} is confirmed and being prepared.`,
    data: { orderId: order._id },
  })

export const notifyOrderPreparing = (userId, order) =>
  create({
    user: userId,
    type: 'order',
    emoji: '👨‍🍳',
    title: 'Order preparing',
    message: 'Your pizza is in the kitchen. Fresh ingredients, hot oven!',
    data: { orderId: order._id, status: order.status },
  })

export const notifyOutForDelivery = (userId, order) =>
  create({
    user: userId,
    type: 'order',
    emoji: '🛵',
    title: 'Out for delivery',
    message: 'Your order is on the way. Track it in My Orders.',
    data: { orderId: order._id, status: order.status },
  })

export const notifyOrderDelivered = (userId, order) =>
  create({
    user: userId,
    type: 'order',
    emoji: '🎉',
    title: 'Delivered',
    message: 'Enjoy your meal! Rate your experience on the pizza page.',
    data: { orderId: order._id, status: order.status },
  })

export const notifyRewardUnlocked = (userId, tierName) =>
  create({
    user: userId,
    type: 'reward',
    emoji: '🎉',
    title: 'Reward milestone',
    message: `You unlocked ${tierName} Rewards Tier.`,
    data: { tier: tierName },
  })

export const notifyCouponAvailable = (userId, code, description) =>
  create({
    user: userId,
    type: 'coupon',
    emoji: '🔥',
    title: 'Coupon available',
    message: description || `Use code ${code} on your next order.`,
    data: { code },
  })

export const notifyNewPizza = (userId, pizzaName) =>
  create({
    user: userId,
    type: 'promo',
    emoji: '🍕',
    title: 'New on the menu',
    message: `Freshly baked ${pizzaName} is now available.`,
    data: { pizzaName },
  })

export const notifyPromo = (userId, message) =>
  create({
    user: userId,
    type: 'promo',
    emoji: '🔥',
    title: 'Limited time offer',
    message,
  })

export const notifyRecommendation = (userId, pizzaName) =>
  create({
    user: userId,
    type: 'recommendation',
    emoji: '⭐',
    title: 'Picked for you',
    message: `Based on your taste — try ${pizzaName} tonight.`,
    data: { pizzaName },
  })

// ── Admin notifications ───────────────────────────────────────────

export const notifyAdminNewOrder = (order, customerName) =>
  create({
    audience: 'admin',
    type: 'order',
    emoji: '🧾',
    title: 'New order',
    message: `${customerName || 'Customer'} placed order #${order._id.toString().slice(-8).toUpperCase()} — ₹${order.totalPrice.toFixed(2)}`,
    data: { orderId: order._id },
  })

export const notifyAdminLowInventory = (itemName, stock) =>
  create({
    audience: 'admin',
    type: 'inventory',
    emoji: '⚠️',
    title: 'Low inventory',
    message: `${itemName} is running low (${stock} remaining).`,
    data: { itemName, stock },
  })

export const notifyAdminFailedPayment = (userId, razorpayOrderId, reason) =>
  create({
    audience: 'admin',
    type: 'payment',
    emoji: '❌',
    title: 'Failed payment',
    message: reason || `Payment failed for Razorpay order ${razorpayOrderId}`,
    data: { userId, razorpayOrderId },
  })

export const notifyAdminNewReview = (pizzaName, rating) =>
  create({
    audience: 'admin',
    type: 'review',
    emoji: '⭐',
    title: 'New review',
    message: `${pizzaName} received a ${rating}-star review.`,
    data: { pizzaName, rating },
  })

export const notifyAdminNewUser = (userName, email) =>
  create({
    audience: 'admin',
    type: 'registration',
    emoji: '👤',
    title: 'New registration',
    message: `${userName} (${email}) just signed up.`,
    data: { email },
  })

// ── Query helpers ─────────────────────────────────────────────────

export const getUserNotifications = (userId, { limit = 50, unreadOnly = false } = {}) => {
  const filter = {
    audience: { $in: ['user', 'broadcast'] },
    $or: [{ user: userId }, { audience: 'broadcast' }],
  }
  if (unreadOnly) filter.read = false
  return Notification.find(filter).sort({ createdAt: -1 }).limit(limit)
}

export const getAdminNotifications = ({ limit = 50 } = {}) =>
  Notification.find({ audience: 'admin' }).sort({ createdAt: -1 }).limit(limit)

export const markNotificationRead = (id, userId, isAdmin = false) => {
  if (isAdmin) {
    return Notification.findOneAndUpdate(
      { _id: id, audience: 'admin' },
      { read: true },
      { new: true }
    )
  }
  return Notification.findOneAndUpdate(
    {
      _id: id,
      audience: { $in: ['user', 'broadcast'] },
      $or: [{ user: userId }, { audience: 'broadcast' }],
    },
    { read: true },
    { new: true }
  )
}

export const markAllNotificationsRead = (userId, isAdmin = false) => {
  const filter = isAdmin
    ? { audience: 'admin', read: false }
    : {
        audience: { $in: ['user', 'broadcast'] },
        $or: [{ user: userId }, { audience: 'broadcast' }],
        read: false,
      }
  return Notification.updateMany(filter, { read: true })
}

export const handleOrderStatusNotification = (userId, order, status) => {
  emitOrderStatusUpdate(userId, order._id.toString(), status, {
    statusHistory: order.statusHistory,
    lastStatusUpdateAt: order.lastStatusUpdateAt,
  })

  if (status === ORDER_STATUS.RECEIVED) return notifyOrderConfirmed(userId, order)
  if (status === ORDER_STATUS.KITCHEN) return notifyOrderPreparing(userId, order)
  if (status === ORDER_STATUS.DELIVERY) return notifyOutForDelivery(userId, order)
  if (status === ORDER_STATUS.DELIVERED) return notifyOrderDelivered(userId, order)
  return null
}
