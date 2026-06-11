/**
 * Email utilities — delegates to production SMTP in services/emailService.js
 */
import {
  sendEmail,
  verifySMTPConnection,
  isSmtpReady,
} from '../services/emailService.js'

export { sendEmail, verifySMTPConnection, isSmtpReady }

// ── Email verification ────────────────────────────────────────────
export const sendVerificationEmail = async (user, token) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  const url = `${base}/verify-email/${token}`
  await sendEmail({
    to: user.email,
    subject: 'Verify your PizzaHub account',
    html: `
      <h2>Hi ${user.name}!</h2>
      <p>Welcome to PizzaHub. Please verify your email to activate your account.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;background:#f97316;
        color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
        Verify Email
      </a>
      <p style="color:#666;font-size:12px;margin-top:16px;">
        This link expires in 24 hours and can only be used once.
      </p>
    `,
  })
}

// ── Forgot password ───────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, token) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  const url = `${base}/reset-password/${token}`
  await sendEmail({
    to: user.email,
    subject: 'Reset your PizzaHub password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. Valid for 1 hour.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;background:#f97316;
        color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
        Reset Password
      </a>
      <p style="color:#666;font-size:12px;">If you didn't request this, ignore this email.</p>
    `,
  })
}

// ── Low stock alert to admin ──────────────────────────────────────
export const sendLowStockAlert = async (ingredient) => {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  await sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${ingredient.name}`,
    html: `
      <h2>Inventory Alert</h2>
      <p>
        <strong>${ingredient.name}</strong> (${ingredient.category}) stock has dropped
        to <strong>${ingredient.stock} units</strong>, which is below the threshold of
        ${ingredient.alertThreshold} units.
      </p>
      <p>Please restock as soon as possible to avoid disruptions.</p>
    `,
  })
}
