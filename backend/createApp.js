import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import mongoose from 'mongoose'
import os from 'os'
import authRoutes from './routes/auth.js'
import pizzaRoutes from './routes/pizza.js'
import orderRoutes from './routes/orders.js'
import usersRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'
import couponRoutes from './routes/couponRoutes.js'
import bannerRoutes from './routes/bannerRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import { authLimiter, apiLimiter } from './middleware/rateLimiters.js'
import { getIO } from './utils/socket.js'

const configuredClientUrls = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((url) => url.trim()).filter(Boolean)
  : []

const allowedOrigins = [
  ...new Set([
    process.env.CLIENT_URL,
    ...configuredClientUrls,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://oibsip-frontend.vercel.app',
  ].filter(Boolean)),
]

const helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}

if (process.env.NODE_ENV === 'production') {
  helmetOptions.hsts = { maxAge: 31536000, includeSubDomains: true, preload: true }
}

const dbStatusMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

export function createApp() {
  const app = express()
  const httpServer = createServer(app)

  app.use(helmet(helmetOptions))
  app.use(mongoSanitize())
  app.use(xss())
  app.use(requestLogger)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        callback(new Error(`CORS policy does not allow access from origin ${origin}`))
      },
      credentials: true,
    })
  )

  app.use('/api/auth', authLimiter)
  app.use('/api', apiLimiter)

  app.use(express.json({ limit: '10kb' }))
  app.use(express.urlencoded({ extended: true, limit: '10kb' }))

  app.use('/api/auth', authRoutes)
  app.use('/api/pizza', pizzaRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/users', usersRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/coupons', couponRoutes)
  app.use('/api/banners', bannerRoutes)
  app.use('/api/reviews', reviewRoutes)
  app.use('/api/rewards', rewardRoutes)
  app.use('/api/notifications', notificationRoutes)

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  })

  app.get('/api/health/metrics', (_req, res) => {
    const mem = process.memoryUsage()
    res.json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
      activeSessions: getIO()?.sockets?.sockets?.size ?? 0,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    })
  })

  app.use(notFound)
  app.use(errorHandler)

  return { app, httpServer }
}

export default createApp
