import 'dotenv/config'
import connectDB from './config/db.js'
import { initSocket } from './utils/socket.js'
import { createApp } from './createApp.js'
import logger from './utils/logger.js'
import { verifySMTPConnection } from './services/emailService.js'

// ── Connect to MongoDB ───────────────────────────────────────────
await connectDB()

// ── Verify production SMTP (non-blocking for API) ─────────────────
await verifySMTPConnection()

const requiredEnvs = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']
const missing = requiredEnvs.filter((k) => !process.env[k])
if (missing.length) {
  logger.error('Missing required env vars', { missing })
  process.exit(1)
}

const { app, httpServer } = createApp()

// ── Init Socket.IO ───────────────────────────────────────────────
initSocket(httpServer)

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack })
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Pizza backend running on port ${PORT}`)
})

export { app, httpServer }
