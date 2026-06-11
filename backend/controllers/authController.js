import crypto from 'crypto'
import User   from '../models/User.js'
import { hashVerificationToken, buildVerifyEmailUrl } from '../utils/emailVerification.js'
import Pizza  from '../models/Pizza.js'
import { createSendToken }          from '../utils/token.js'
import {
  sendWelcomeEmail,
  sendVerifyEmailTemplate,
  sendPasswordResetTemplate,
} from '../services/EmailTemplateService.js'
import { notifyAdminNewUser } from '../services/NotificationService.js'

// ── Register ─────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      emailVerified: false,
      isEmailVerified: false,
      isVerified: false,
    })
    const token = user.createEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    console.log('REGISTER USER', {
      email: user.email,
      emailVerified: user.emailVerified,
    })

    const verifyUrl = buildVerifyEmailUrl(token)
    sendVerifyEmailTemplate(user, verifyUrl).catch(() => {})
    notifyAdminNewUser(user.name, user.email).catch(() => {})

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true,
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
    if (!user.isAccountVerified()) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      })
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
    const { token } = req.params
    if (!token) {
      return res.status(400).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Verification token is required',
      })
    }

    const hashedToken = hashVerificationToken(token)
    const now = Date.now()

    const pendingUser = await User.findByVerificationToken(hashedToken)
    const beforeVerification = pendingUser?.isAccountVerified() ?? false

    const verifiedUser = await User.findOneAndUpdate(
      {
        $or: [
          { emailVerificationToken: hashedToken, emailVerificationExpires: { $gt: now } },
          { verificationToken: hashedToken, verificationTokenExpires: { $gt: now } },
        ],
        emailVerified: false,
        isEmailVerified: false,
        isVerified: false,
      },
      {
        $set: {
          emailVerified: true,
          isEmailVerified: true,
          isVerified: true,
          lastVerifiedTokenHash: hashedToken,
          welcomeEmailSent: true,
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: '',
          verificationToken: '',
          verificationTokenExpires: '',
        },
      },
      { new: true }
    )

    console.log('VERIFY EMAIL', {
      email: pendingUser?.email ?? verifiedUser?.email,
      beforeVerification,
      afterVerification: verifiedUser ? true : beforeVerification,
    })

    if (verifiedUser) {
      sendWelcomeEmail(verifiedUser).catch(() => {})

      return res.status(200).json({
        success: true,
        code: 'EMAIL_VERIFIED',
        message: 'Email verified successfully',
      })
    }

    const alreadyVerified = await User.findByConsumedVerificationToken(hashedToken)
    if (alreadyVerified) {
      return res.status(208).json({
        success: true,
        code: 'ALREADY_VERIFIED',
        message: 'Email already verified',
      })
    }

    const tokenOwner = await User.findByVerificationTokenHash(hashedToken)

    if (tokenOwner?.isAccountVerified()) {
      return res.status(208).json({
        success: true,
        code: 'ALREADY_VERIFIED',
        message: 'Email already verified',
      })
    }

    if (tokenOwner && tokenOwner.isVerificationTokenExpired()) {
      return res.status(410).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Verification link has expired',
      })
    }

    return res.status(400).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Verification link is invalid',
    })
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

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`
    sendPasswordResetTemplate(user, resetUrl).catch(() => {})

    return res.json({
      message: 'If that email is registered, a reset link has been sent.',
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

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (err) { next(err) }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) { next(err) }
}

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites')
    res.json(user?.favorites || [])
  } catch (err) { next(err) }
}

export const addFavorite = async (req, res, next) => {
  try {
    const pizzaId = req.params.pizzaId
    const pizza = await Pizza.findById(pizzaId)
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' })
    }

    const user = await User.findById(req.user._id)
    if (!user.favorites.includes(pizzaId)) {
      user.favorites.push(pizzaId)
      await user.save()
    }

    await user.populate('favorites')
    res.json(user.favorites)
  } catch (err) { next(err) }
}

// ── Resend Verification Email ─────────────────────────────────────
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.json({ message: 'If that email is registered, a verification link has been sent.' })
    }
    if (user.isAccountVerified()) {
      return res.json({
        success: true,
        message: 'Email is already verified. You can log in.',
      })
    }

    const token = user.createEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    const verifyUrl = buildVerifyEmailUrl(token)
    sendVerifyEmailTemplate(user, verifyUrl).catch(() => {})

    res.json({
      success: true,
      message: 'If that email is registered, a verification link has been sent.',
    })
  } catch (err) {
    next(err)
  }
}

export const removeFavorite = async (req, res, next) => {
  try {
    const pizzaId = req.params.pizzaId
    const user = await User.findById(req.user._id)
    user.favorites = user.favorites.filter((item) => item.toString() !== pizzaId)
    await user.save()
    await user.populate('favorites')
    res.json(user.favorites)
  } catch (err) { next(err) }
}
