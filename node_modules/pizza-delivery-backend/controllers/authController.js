import crypto from 'crypto'
import User   from '../models/User.js'
import { createSendToken }          from '../utils/token.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js'

// ── Register ─────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user  = await User.create({ name, email, password })
    const token = user.createEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    //await sendVerificationEmail(user, token)

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    })
  } catch (err) { next(err) }
}

// ── Login ─────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' })
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins must use the admin login endpoint' })
    }

    createSendToken(user, 200, res)
  } catch (err) { next(err) }
}

// ── Admin Login ───────────────────────────────────────────────────
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email, role: 'admin' }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    createSendToken(user, 200, res)
  } catch (err) { next(err) }
}

// ── Verify Email ──────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires')

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' })
    }

    user.isEmailVerified          = true
    user.emailVerificationToken   = undefined
    user.emailVerificationExpires = undefined
    await user.save({ validateBeforeSave: false })

    res.json({ message: 'Email verified successfully. You can now log in.' })
  } catch (err) { next(err) }
}

// ── Forgot Password ───────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.json({
        message: 'If that email is registered, a reset link has been sent.',
      })
    }

    const token = user.createPasswordResetToken()

    await user.save({ validateBeforeSave: false })

    console.log('\n========== RESET LINK ==========')
    console.log(`${process.env.CLIENT_URL}/reset-password/${token}`)
    console.log('================================\n')

    return res.json({
      message: 'Reset link generated successfully.',
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
// ── Reset Password ────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires')

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' })
    }

    user.password             = req.body.password
    user.passwordResetToken   = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful. You can now log in.' })
  } catch (err) { next(err) }
}

// ── Get current user (me) ─────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user })
  } catch (err) { next(err) }
}
