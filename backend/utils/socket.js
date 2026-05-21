import { Server } from 'socket.io'
import { verifySocketToken } from '../middleware/auth.js'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  // ── Auth middleware ──────────────────────────────────────────
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

  // ── Connection ───────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    // Each user joins their own room so status updates are targeted
    socket.join(`user:${userId}`)
    console.log(`🔌  Socket connected: ${socket.id} (user ${userId})`)

    socket.on('disconnect', () => {
      console.log(`🔌  Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

/**
 * Emit an order status update to the order's owner.
 * Called from the order controller after admin changes status.
 */
export const emitOrderStatusUpdate = (userId, orderId, status) => {
  if (!io) return
  io.to(`user:${userId.toString()}`).emit('orderStatusUpdated', { orderId, status })
}

export const getIO = () => io
