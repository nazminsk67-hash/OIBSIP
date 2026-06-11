import { logRequest } from '../utils/logger.js'

/**
 * Lightweight request logger — records after response finishes.
 * Does not block the request pipeline.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const durationMs = Date.now() - start
    if (req.originalUrl === '/api/health') return
    logRequest(req, res, durationMs)
  })
  next()
}

export default requestLogger
