import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'

let transporter = null
let smtpVerified = false

const isSandboxMailtrap = () => {
  const host = (process.env.SMTP_HOST || '').toLowerCase()
  return host.includes('sandbox.smtp.mailtrap.io')
}

const getTransportOptions = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required')
  }

  const secure = port === 465 || process.env.SMTP_SECURE === 'true'

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  }
}

/**
 * Singleton Nodemailer transporter (production SMTP).
 */
export const getTransporter = () => {
  if (transporter) return transporter
  transporter = nodemailer.createTransport(getTransportOptions())
  return transporter
}

/**
 * Verify SMTP at server startup. Logs success or failure to console + Winston.
 */
export const verifySMTPConnection = async () => {
  if (isSandboxMailtrap()) {
    const sandboxMsg =
      'Mailtrap SANDBOX detected (sandbox.smtp.mailtrap.io). Emails are NOT delivered to real inboxes. ' +
      'Use production SMTP (e.g. live.smtp.mailtrap.io, Gmail App Password, SendGrid, Brevo).'
    console.log('SMTP Connection Failed')
    console.log(sandboxMsg)
    logger.warn('SMTP sandbox mode', { host: process.env.SMTP_HOST, hint: sandboxMsg })
    smtpVerified = false
    return false
  }

  if (!process.env.EMAIL_FROM) {
    console.log('SMTP Connection Failed')
    logger.error('SMTP Connection Failed', { reason: 'EMAIL_FROM is not set' })
    smtpVerified = false
    return false
  }

  try {
    const transport = getTransporter()
    await transport.verify()
    smtpVerified = true
    console.log('SMTP Connected Successfully')
    logger.info('SMTP Connected Successfully', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      from: process.env.EMAIL_FROM,
    })
    return true
  } catch (err) {
    smtpVerified = false
    console.log('SMTP Connection Failed')
    logger.error('SMTP Connection Failed', {
      message: err.message,
      code: err.code,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
    })
    return false
  }
}

export const isSmtpReady = () => smtpVerified

/**
 * Send email via production SMTP with structured logging.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM
  if (!from) {
    logger.error('Email Failed', { reason: 'EMAIL_FROM missing', to, subject })
    throw new Error('EMAIL_FROM environment variable is required')
  }

  if (!to || !subject) {
    logger.error('Email Failed', { reason: 'Missing to or subject', to, subject })
    throw new Error('Email recipient and subject are required')
  }

  try {
    const transport = getTransporter()
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
      text,
    })

    console.log('Email Sent', { to, subject, messageId: info.messageId })
    logger.info('Email Sent', {
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
    })

    return info
  } catch (err) {
    console.log('Email Failed', { to, subject, error: err.message })
    logger.error('Email Failed', {
      to,
      subject,
      message: err.message,
      code: err.code,
    })
    logger.error('SMTP Error', {
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    })
    throw err
  }
}

// ── Legacy template helpers (used by some flows) ─────────────────

const buildButton = (text, url) => `
  <a href="${url}" style="display:inline-block;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">${text}</a>
`

export const sendRegistrationSuccessEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: '🎉 Welcome to PizzaHub',
      html: `
        <h2>Welcome ${user.name}!</h2>
        <p>Your account has been created successfully. Start exploring our pizza menu and enjoy live delivery tracking.</p>
        ${buildButton('Visit PizzaHub', process.env.CLIENT_URL)}
        <p style="color:#666;font-size:12px;margin-top:16px;">If you did not sign up for this account, please contact support.</p>
      `,
    })
  } catch (error) {
    logger.error('Welcome email failed', { to: user.email, message: error.message })
  }
}

export const sendOrderPlacedEmail = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: '🍕 Order received — PizzaHub',
      html: `
        <h2>Order received</h2>
        <p>Thanks for ordering, ${user.name}!</p>
        <p>Your order <strong>#${order._id?.toString().slice(-8).toUpperCase()}</strong> is being prepared.</p>
        <p>Total: <strong>₹${order.totalPrice.toFixed(2)}</strong></p>
        ${buildButton('View your order', `${process.env.CLIENT_URL}/my-orders`)}
      `,
    })
  } catch (error) {
    logger.error('Order placed email failed', { message: error.message })
  }
}

export const sendOrderDeliveredEmail = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: '✅ Order delivered — Enjoy your pizza!',
      html: `
        <h2>Your order has arrived</h2>
        <p>Hi ${user.name}, your order <strong>#${order._id?.toString().slice(-8).toUpperCase()}</strong> has been delivered.</p>
        <p>We hope you enjoy your meal. Visit PizzaHub again for more tasty pizzas.</p>
        ${buildButton('Browse menu', process.env.CLIENT_URL)}
      `,
    })
  } catch (error) {
    logger.error('Order delivered email failed', { message: error.message })
  }
}

export const sendCouponReceivedEmail = async (user, coupon, discount) => {
  try {
    await sendEmail({
      to: user.email,
      subject: '🎁 Coupon applied successfully',
      html: `
        <h2>Coupon applied</h2>
        <p>You have successfully applied coupon <strong>${coupon.code}</strong> and saved ₹${discount.toFixed(2)}.</p>
        <p>Thanks for choosing PizzaHub.</p>
        ${buildButton('Continue to checkout', `${process.env.CLIENT_URL}/checkout`)}
      `,
    })
  } catch (error) {
    logger.error('Coupon email failed', { message: error.message })
  }
}

export const sendPasswordResetEmailTemplate = async (user, token) => {
  try {
    const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
    const url = `${base}/reset-password/${token}`
    await sendEmail({
      to: user.email,
      subject: '🔑 Reset your PizzaHub password',
      html: `
        <h2>Password reset request</h2>
        <p>To reset your password, click the button below. This link is valid for 1 hour.</p>
        ${buildButton('Reset Password', url)}
        <p style="color:#666;font-size:12px;margin-top:16px;">If you did not request this email, simply ignore it.</p>
      `,
    })
  } catch (error) {
    logger.error('Password reset email failed', { to: user.email, message: error.message })
    throw error
  }
}
