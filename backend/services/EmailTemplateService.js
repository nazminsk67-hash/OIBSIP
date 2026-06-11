import { sendEmail } from './emailService.js'

const brandColor = '#f97316'
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173'

const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PizzaHub</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:${brandColor};padding:24px;text-align:center;">
              <span style="font-size:28px;">🍕</span>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;">PizzaHub</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;color:#334155;font-size:15px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:#f1f5f9;text-align:center;font-size:12px;color:#64748b;">
              © ${new Date().getFullYear()} PizzaHub · Fresh pizza, fast delivery
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const button = (text, url) => `
  <p style="margin:28px 0;text-align:center;">
    <a href="${url}" style="display:inline-block;padding:14px 28px;background:${brandColor};color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">${text}</a>
  </p>
`

export const sendWelcomeEmail = async (user) => {
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Welcome, ${user.name}! 🎉</h2>
    <p>Your PizzaHub account is ready. Explore our menu, earn rewards, and track deliveries in real time.</p>
    ${button('Start ordering', clientUrl())}
  `)
  return sendEmail({ to: user.email, subject: '🎉 Welcome to PizzaHub', html })
}

export const sendVerifyEmailTemplate = async (user, verifyUrl) => {
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Welcome to PizzaHub!</h2>
    <p>Hi ${user.name}, thanks for signing up. Please verify your email address to activate your account and start ordering.</p>
    ${button('Verify Email', verifyUrl)}
    <p style="font-size:13px;color:#64748b;margin-top:20px;">
      This link expires in <strong>24 hours</strong> and can only be used once.
      If you did not create an account, you can safely ignore this email.
    </p>
  `)
  return sendEmail({ to: user.email, subject: 'Verify your PizzaHub account', html })
}

export const sendPasswordResetTemplate = async (user, resetUrl) => {
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Reset your password</h2>
    <p>Hi ${user.name}, we received a request to reset your password. This link is valid for 1 hour and can only be used once.</p>
    ${button('Reset password', resetUrl)}
    <p style="font-size:13px;color:#64748b;">If you didn't request this, you can safely ignore this email.</p>
  `)
  return sendEmail({ to: user.email, subject: '🔑 Reset your PizzaHub password', html })
}

export const sendOrderConfirmationTemplate = async (user, order) => {
  const orderRef = order._id?.toString().slice(-8).toUpperCase()
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Order confirmed! 🍕</h2>
    <p>Thanks ${user.name}! Order <strong>#${orderRef}</strong> is confirmed.</p>
    <p style="background:#f8fafc;padding:16px;border-radius:8px;">
      <strong>Total:</strong> ₹${order.totalPrice.toFixed(2)}<br/>
      <strong>Status:</strong> ${order.status}
    </p>
    ${button('Track order', `${clientUrl()}/my-orders`)}
  `)
  return sendEmail({ to: user.email, subject: `🍕 Order #${orderRef} confirmed`, html })
}

export const sendOrderDispatchedTemplate = async (user, order) => {
  const orderRef = order._id?.toString().slice(-8).toUpperCase()
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">On the way! 🛵</h2>
    <p>Hi ${user.name}, your order <strong>#${orderRef}</strong> is out for delivery.</p>
    ${button('Track delivery', `${clientUrl()}/my-orders`)}
  `)
  return sendEmail({ to: user.email, subject: `🛵 Order #${orderRef} dispatched`, html })
}

export const sendOrderDeliveredTemplate = async (user, order) => {
  const orderRef = order._id?.toString().slice(-8).toUpperCase()
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Delivered! 🎉</h2>
    <p>Hi ${user.name}, your order <strong>#${orderRef}</strong> has been delivered. Enjoy your meal!</p>
    ${button('Order again', clientUrl())}
  `)
  return sendEmail({ to: user.email, subject: `✅ Order #${orderRef} delivered`, html })
}

export const sendRewardUnlockedTemplate = async (user, tierName, points) => {
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Reward unlocked! 🎉</h2>
    <p>Congratulations ${user.name}! You've reached <strong>${tierName}</strong> tier with ${points} reward points.</p>
    ${button('View rewards', `${clientUrl()}/rewards`)}
  `)
  return sendEmail({ to: user.email, subject: `🎉 ${tierName} tier unlocked`, html })
}

export const sendCouponReceivedTemplate = async (user, coupon, discount) => {
  const html = layout(`
    <h2 style="margin:0 0 12px;color:#0f172a;">Coupon applied! 🎁</h2>
    <p>Hi ${user.name}, you saved <strong>₹${discount.toFixed(2)}</strong> with code <strong>${coupon.code}</strong>.</p>
    ${button('Continue shopping', `${clientUrl()}/pizzas`)}
  `)
  return sendEmail({ to: user.email, subject: '🎁 Coupon applied successfully', html })
}
