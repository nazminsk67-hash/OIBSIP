import crypto from 'crypto'

export const hashVerificationToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex')

export const buildVerifyEmailUrl = (rawToken) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  return `${base}/verify-email/${rawToken}`
}
