import 'dotenv/config'
import express        from 'express'
import { createServer } from 'http'
import cors           from 'cors'
import helmet         from 'helmet'
import rateLimit      from 'express-rate-limit'
import mongoSanitize  from 'express-mongo-sanitize'
import xss            from 'xss-clean'
import connectDB      from './config/db.js'
import { initSocket } from './utils/socket.js'
import authRoutes     from './routes/auth.js'
import pizzaRoutes    from './routes/pizza.js'
import orderRoutes    from './routes/orders.js'
import usersRoutes    from './routes/users.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

// ── Connect to MongoDB ───────────────────────────────────────────
await connectDB()

const app        = express()
const httpServer = createServer(app)

// ── Init Socket.IO ───────────────────────────────────────────────
initSocket(httpServer)

// ── Environment validation (fail fast) ───────────────────────────
const requiredEnvs = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']
const missing = requiredEnvs.filter((k) => !process.env[k])
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '))
  process.exit(1)
}

// ── Security middleware ──────────────────────────────────────────
// Disable CSP from helmet to avoid interfering with client-side bundlers and socket connections
app.use(helmet({ contentSecurityPolicy: false }))
app.use(mongoSanitize())
app.use(xss())

// Rate limiter for APIs to mitigate brute force / abuse
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
app.use('/api', apiLimiter)

// ── Global Middleware ────────────────────────────────────────────
// Safer CORS: allow CLIENT_URL and localhost dev ports
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://oibsip-frontend.vercel.app'].filter(Boolean)
app.use(
  cors({ origin: allowedOrigins, credentials: true })
)

// Body parsing with reasonable limits
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth',   authRoutes)
app.use('/api/pizza',  pizzaRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users',  usersRoutes)

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Error Handling ───────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🍕 Pizza backend running on port ${PORT}`)
})
