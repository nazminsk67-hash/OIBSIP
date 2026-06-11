import mongoose from 'mongoose'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Pizza from '../models/Pizza.js'
import DeliveryAssignment from '../models/DeliveryAssignment.js'
import Settings from '../models/Settings.js'
import AuditLog from '../models/AuditLog.js'
import Inventory from '../models/Inventory.js'
import Coupon from '../models/Coupon.js'
import Banner from '../models/Banner.js'
import RewardTransaction from '../models/RewardTransaction.js'
import { recordAudit } from '../services/AuditLogService.js'
import { getIO } from '../utils/socket.js'

export const searchGlobal = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim()
    if (!query) {
      return res.json({ pizzas: [], users: [], orders: [] })
    }

    const regex = new RegExp(query, 'i')
    const pizzaPromise = Pizza.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex },
      ],
    })
      .limit(10)
      .select('name category price description')

    const userPromise = User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .limit(10)
      .select('name email role createdAt')

    const orderQuery = [{ address: regex }, { phone: regex }, { status: regex }]
    if (mongoose.Types.ObjectId.isValid(query)) {
      orderQuery.unshift({ _id: new mongoose.Types.ObjectId(query) })
    }

    const orderPromise = Order.find({ $or: orderQuery })
      .limit(10)
      .populate('user', 'name email')
      .select('status address phone totalPrice createdAt')

    const [pizzas, users, orders] = await Promise.all([pizzaPromise, userPromise, orderPromise])

    res.json({ pizzas, users, orders })
  } catch (err) {
    next(err)
  }
}

export const getAdminCustomers = async (req, res, next) => {
  try {
    const { search, active } = req.query
    const match = { role: 'user' }
    if (search) {
      const regex = new RegExp(search.trim(), 'i')
      match.$or = [{ name: regex }, { email: regex }]
    }
    if (active === 'true') {
      match.isEmailVerified = true
    }

    const users = await User.find(match).sort({ createdAt: -1 }).lean()
    const userIds = users.map((u) => u._id)

    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ])

    const statsMap = orderStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat
      return acc
    }, {})

    const result = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      totalOrders: statsMap[user._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[user._id.toString()]?.totalSpent || 0,
    }))

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export const getHealthMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalPizzas = await Pizza.countDocuments()
    const totalOrders = await Order.countDocuments()
    const revenueData = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
    ])
    const revenue = revenueData[0]?.revenue || 0
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }
    const activeSessions = getIO()?.sockets?.sockets?.size || 0
    const mem = process.memoryUsage()

    res.json({
      totalUsers,
      totalPizzas,
      totalOrders,
      revenue,
      activeSessions,
      databaseStatus: dbStatusMap[mongoose.connection.readyState] || 'unknown',
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        memoryRssMb: Math.round(mem.rss / 1024 / 1024),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body
    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    })
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

const computeStatus = ({ stock, minimumStock }) => {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= minimumStock) return 'low-stock'
  return 'in-stock'
}

export const createInventoryItem = async (req, res, next) => {
  try {
    const { name, stock, unit, minimumStock } = req.body

    if (!name || typeof stock === 'undefined' || !unit || typeof minimumStock === 'undefined') {
      return res.status(400).json({ message: 'All inventory fields are required' })
    }

    const item = await Inventory.create({
      name: name.trim(),
      stock,
      unit: unit.trim(),
      minimumStock,
      status: computeStatus({ stock, minimumStock }),
    })

    await recordAudit({
      adminId: req.user._id,
      action: 'Created inventory item',
      entityType: 'Inventory',
      entityId: item._id.toString(),
      details: { name: item.name, stock: item.stock, unit: item.unit, minimumStock: item.minimumStock, status: item.status },
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

export const updateInventoryItem = async (req, res, next) => {
  try {
    const updates = req.body
    if (typeof updates.stock !== 'undefined') {
      updates.stock = Number(updates.stock)
    }
    if (typeof updates.minimumStock !== 'undefined') {
      updates.minimumStock = Number(updates.minimumStock)
    }

    const existingItem = await Inventory.findById(req.params.id)
    if (!existingItem) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    const merged = {
      name: typeof updates.name !== 'undefined' ? updates.name : existingItem.name,
      stock: typeof updates.stock !== 'undefined' ? updates.stock : existingItem.stock,
      unit: typeof updates.unit !== 'undefined' ? updates.unit : existingItem.unit,
      minimumStock:
        typeof updates.minimumStock !== 'undefined' ? updates.minimumStock : existingItem.minimumStock,
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        ...merged,
        status: computeStatus(merged),
      },
      { new: true, runValidators: true }
    )

    await recordAudit({
      adminId: req.user._id,
      action: 'Updated inventory item',
      entityType: 'Inventory',
      entityId: updatedItem._id.toString(),
      details: { changes: updates },
    })

    res.json(updatedItem)
  } catch (err) {
    next(err)
  }
}

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    await recordAudit({
      adminId: req.user._id,
      action: 'Deleted inventory item',
      entityType: 'Inventory',
      entityId: item._id.toString(),
      details: { name: item.name, stock: item.stock, unit: item.unit, minimumStock: item.minimumStock, status: item.status },
    })

    res.json({ message: 'Inventory item deleted' })
  } catch (err) {
    next(err)
  }
}

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(200)
    res.json(logs)
  } catch (err) {
    next(err)
  }
}

export const getDeliveryAssignments = async (req, res, next) => {
  try {
    const assignments = await DeliveryAssignment.find()
      .populate('order', 'address status totalPrice createdAt')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(assignments)
  } catch (err) {
    next(err)
  }
}

export const createDeliveryAssignment = async (req, res, next) => {
  try {
    const { orderId, deliveryPerson, notes } = req.body
    if (!orderId || !deliveryPerson) {
      return res.status(400).json({ message: 'Order and delivery person are required' })
    }
    // Validate orderId is a valid Mongo ObjectId to prevent crashes
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' })
    }
    const assignment = await DeliveryAssignment.create({
      order: orderId,
      deliveryPerson,
      notes,
      assignedBy: req.user._id,
    })
    res.status(201).json(assignment)
  } catch (err) {
    next(err)
  }
}

export const updateDeliveryAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['assigned', 'pickup', 'enroute', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid delivery assignment status' })
    }
    const assignment = await DeliveryAssignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!assignment) {
      return res.status(404).json({ message: 'Delivery assignment not found' })
    }
    res.json(assignment)
  } catch (err) {
    next(err)
  }
}

// ── Admin Inventory (CRUD + audit) ───────────────────────────────
export const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ name: 1 })
    res.json(items)
  } catch (err) {
    next(err)
  }
}

export const getMarketingAnalytics = async (req, res, next) => {
  try {
    // 1. Coupons used
    const coupons = await Coupon.find().lean()
    const totalCouponsUsed = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)
    
    // Top performing coupons
    const topCoupons = [...coupons]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(c => ({ 
        code: c.code, 
        usageCount: c.usageCount || 0, 
        discountType: c.type, 
        discountValue: c.value 
      }))

    // 2. Reward redemptions
    const rewardRedemptions = await RewardTransaction.find({ type: 'redeem' }).lean()
    const totalPointsRedeemed = rewardRedemptions.reduce((sum, r) => sum + (r.points || 0), 0)
    const redemptionCount = rewardRedemptions.length

    // 3. Active banners
    const activeBannersCount = await Banner.countDocuments({ active: true })

    // 4. Conversion rate
    // We can compute the conversion rate as: (orders with coupon or rewards applied / total orders) * 100
    // If total orders is 0, we can return 0
    const totalOrders = await Order.countDocuments()
    const ordersWithDiscount = await Order.countDocuments({
      $or: [
        { couponDiscount: { $gt: 0 } },
        { rewardDiscount: { $gt: 0 } }
      ]
    })
    const conversionRate = totalOrders > 0 
      ? Math.round((ordersWithDiscount / totalOrders) * 10000) / 100 
      : 0

    // 5. Coupon usage trend (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    // Trend for coupons: group usageHistory by date
    const couponTrend = last7Days.map(date => {
      let count = 0
      coupons.forEach(c => {
        if (c.usageHistory) {
          c.usageHistory.forEach(h => {
            const hDate = new Date(h.usedAt || h.createdAt || Date.now()).toISOString().split('T')[0]
            if (hDate === date) {
              count++
            }
          })
        }
      })
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        usages: count
      }
    })

    // Trend for rewards: group rewardRedemptions by date
    const rewardTrend = last7Days.map(date => {
      let points = 0
      rewardRedemptions.forEach(r => {
        const rDate = new Date(r.createdAt).toISOString().split('T')[0]
        if (rDate === date) {
          points += r.points || 0
        }
      })
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        points
      }
    })

    res.json({
      couponsUsed: totalCouponsUsed,
      rewardRedemptions: totalPointsRedeemed,
      redemptionCount,
      activeBanners: activeBannersCount,
      conversionRate,
      topCoupons,
      couponTrend,
      rewardTrend
    })
  } catch (err) {
    next(err)
  }
}