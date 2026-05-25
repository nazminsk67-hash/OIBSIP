import nodemailer from 'nodemailer'

const createTransporter = () => {
  console.log(process.env.SMTP_HOST)
  console.log(process.env.SMTP_PORT)
  console.log(process.env.SMTP_USER)

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ── Generic send ─────────────────────────────────────────────────
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@pizzadelivery.com',
    to,
    subject,
    html,
  })
}

// ── Email verification ────────────────────────────────────────────
export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`
  await sendEmail({
    to: user.email,
    subject: '🍕 Verify your Pizza Delivery account',
    html: `
      <h2>Hi ${user.name}!</h2>
      <p>Thanks for signing up. Please verify your email to start ordering.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;background:#f97316;
        color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
        Verify Email
      </a>
      <p style="color:#666;font-size:12px;margin-top:16px;">
        Link expires in 24 hours. If you didn't sign up, ignore this.
      </p>
    `,
  })
}

// ── Forgot password ───────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`
  await sendEmail({
    to: user.email,
    subject: '🔑 Reset your Pizza Delivery password',
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
