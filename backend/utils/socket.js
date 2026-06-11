import { Server } from 'socket.io'
import { verifySocketToken } from '../middleware/auth.js'

let io

export const initSocket = (httpServer) => {
  const configuredClientUrls = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((url) => url.trim()).filter(Boolean)
    : []
  const socketOrigins = [...new Set([
    process.env.CLIENT_URL,
    ...configuredClientUrls,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://oibsip-frontend.vercel.app',
  ].filter(Boolean))]

  io = new Server(httpServer, {
    cors: {
      origin: socketOrigins,
      methods: ['GET', 'POST'],
    },
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication error: no token'))
    try {
      socket.user = await verifySocketToken(token)
      next()
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    socket.join(`user:${userId}`)

    if (socket.user.role === 'admin') {
      socket.join('admin')
    }

    console.log(`🔌  Socket connected: ${socket.id} (user ${userId}, role ${socket.user.role})`)

    socket.on('disconnect', () => {
      console.log(`🔌  Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

export const emitOrderStatusUpdate = (userId, orderId, status, extra = {}) => {
  if (!io) return
  io.to(`user:${userId.toString()}`).emit('orderStatusUpdated', {
    audience: 'user',
    orderId,
    status,
    ...extra,
  })
}

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return
  io.to(`user:${userId.toString()}`).emit(event, payload)
}

export const emitToAdmins = (event, payload) => {
  if (!io) return
  io.to('admin').emit(event, payload)
}

export const emitOrderPlaced = (order, customerName) => {
  if (!io) return
  const payload = {
    audience: 'admin',
    orderId: order._id.toString(),
    short: `₹${order.totalPrice.toFixed(2)} from ${customerName || 'customer'}`,
    totalPrice: order.totalPrice,
  }
  emitToAdmins('orderPlaced', payload)
}

export const emitOrderDelivered = (userId, orderId) => {
  if (!io) return
  const payload = { audience: 'user', orderId: orderId.toString() }
  emitToUser(userId, 'orderDelivered', payload)
}

export const emitStockLow = (ingredient, remaining) => {
  if (!io) return
  emitToAdmins('stockLow', { audience: 'admin', ingredient, remaining })
}

export const getIO = () => io
