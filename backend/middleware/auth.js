import jwt  from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Protect – requires a valid Bearer JWT.
 * Attaches `req.user` for downstream handlers.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised – no token' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

/**
 * Admin – must run after `protect`.
 * Rejects non-admin users with 403.
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

/**
 * Socket auth – validates token for socket connections.
 * Returns the decoded user or throws.
 */
export const verifySocketToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user    = await User.findById(decoded.id).select('_id role')
  if (!user) throw new Error('User not found')
  return user
}
