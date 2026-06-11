/**
 * Auth Service - Business logic for authentication
 * Keeps controllers clean and separates concerns
 */

import crypto from 'crypto'
import User from '../models/User.js'
import { hashVerificationToken } from '../utils/emailVerification.js'
import { createSendToken } from '../utils/token.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js'

/**
 * Register a new user
 */
export const registerUser = async (registerData) => {
  const { name, email, password } = registerData

  // Check if email already exists
  const existing = await User.findOne({ email })
  if (existing) {
    throw new Error('Email already in use')
  }

  // Create user — never mark verified at registration
  const user = await User.create({
    name,
    email,
    password,
    emailVerified: false,
    isEmailVerified: false,
    isVerified: false,
  })

  // Generate and send verification email
  const token = user.createEmailVerificationToken()
  await user.save({ validateBeforeSave: false })
  await sendVerificationEmail(user, token)

  return {
    message: 'Registration successful. Please check your email to verify your account.',
    userId: user._id,
  }
}

/**
 * Login user (non-admin)
 */
export const loginUser = async (loginData) => {
  const { email, password } = loginData

  // Find user and check password
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials')
  }

  // Check email verification
  if (!user.isAccountVerified()) {
    throw new Error('Please verify your email before logging in')
  }

  // Ensure user is not admin
  if (user.role === 'admin') {
    throw new Error('Admins must use the admin login endpoint')
  }

  return { user, statusCode: 200 }
}

/**
 * Admin login
 */
export const adminLogin = async (loginData) => {
  const { email, password } = loginData

  // Find user and check password
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid admin credentials')
  }

  // Check if admin
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return { user, statusCode: 200 }
}

/**
 * Verify email with token
 */
export const verifyEmailService = async (token) => {
  const hashedToken = hashVerificationToken(token)

  const alreadyVerified = await User.findByConsumedVerificationToken(hashedToken)
  if (alreadyVerified) {
    return { success: true, statusCode: 208, message: 'Email already verified' }
  }

  const user = await User.findByVerificationToken(hashedToken)
  if (!user) {
    throw new Error('Email verification token is invalid or has expired')
  }

  const beforeVerification = user.isAccountVerified()
  if (beforeVerification) {
    return { success: true, statusCode: 208, message: 'Email already verified' }
  }

  user.markEmailVerified(hashedToken)
  await user.save({ validateBeforeSave: false })

  console.log('VERIFY EMAIL', {
    email: user.email,
    beforeVerification,
    afterVerification: user.emailVerified,
  })

  return { success: true, statusCode: 200, message: 'Email verified successfully' }
}

/**
 * Forgot password - send reset email
 */
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email })

  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, password reset link sent to your email' }
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  await sendPasswordResetEmail(user, resetToken)

  return { message: 'Password reset link sent to your email' }
}

/**
 * Reset password with token
 */
export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires')

  if (!user) {
    throw new Error('Password reset token is invalid or has expired')
  }

  user.password = newPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  return { message: 'Password reset successfully' }
}

/**
 * Get current user
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password')

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
