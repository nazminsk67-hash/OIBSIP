import rateLimit from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production'

const isVerificationRoute = (req) => {
  const path = req.originalUrl || req.url || ''
  return (
    /\/auth\/verify-email\//.test(path) ||
    /\/auth\/resend-verification/.test(path)
  )
}

/**
 * Generous limit for email verification flows — avoids blocking legitimate
 * first clicks (e.g. React Strict Mode double-mount, email client prefetch).
 */
export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many verification attempts. Please try again later.',
  },
})

/** Strict limit for sensitive auth routes; verification routes are excluded. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
  skip: isVerificationRoute,
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => {
    if (isProduction) return false
    return req.path === '/api/health' || req.path === '/api/health/metrics'
  },
})
