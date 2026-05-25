export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ message: `${field} already in use` })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ')
    return res.status(400).json({ message: messages })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
