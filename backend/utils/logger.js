import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import winston from 'winston'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logsDir = path.join(__dirname, '..', 'logs')

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pizza-delivery-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 2_097_152,
      maxFiles: 3,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'admin-activity.log'),
      level: 'info',
      maxsize: 2_097_152,
      maxFiles: 3,
    }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

export const logRequest = (req, res, durationMs) => {
  logger.info('HTTP request', {
    method: req.method,
    path: req.originalUrl,
    status: res.statusCode,
    durationMs,
    ip: req.ip,
  })
}

export const logSecurity = (message, meta = {}) => {
  logger.warn(message, { type: 'security', ...meta })
}

export const logAdminActivity = (message, meta = {}) => {
  logger.info(message, { type: 'admin-activity', ...meta })
}

export default logger
