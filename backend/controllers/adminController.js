import mongoose from 'mongoose'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Pizza from '../models/Pizza.js'
import DeliveryAssignment from '../models/DeliveryAssignment.js'
import Settings from '../models/Settings.js'
import AuditLog from '../models/AuditLog.js'
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

    res.json({
      totalUsers,
      totalPizzas,
      totalOrders,
      revenue,
      activeSessions,
      databaseStatus: dbStatusMap[mongoose.connection.readyState] || 'unknown',
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
