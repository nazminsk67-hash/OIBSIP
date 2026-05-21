import 'dotenv/config'
import express        from 'express'
import { createServer } from 'http'
import cors           from 'cors'
//import connectDB      from './config/db.js'
import { initSocket } from './utils/socket.js'
import authRoutes     from './routes/auth.js'
import pizzaRoutes    from './routes/pizza.js'
import orderRoutes    from './routes/orders.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

// ── Connect to MongoDB ───────────────────────────────────────────
//await connectDB()

const app        = express()
const httpServer = createServer(app)

// ── Init Socket.IO ───────────────────────────────────────────────
initSocket(httpServer)

// ── Global Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth',   authRoutes)
app.use('/api/pizza',  pizzaRoutes)
app.use('/api/orders', orderRoutes)

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Error Handling ───────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🍕  Pizza backend running on http://localhost:${PORT}`)
})
