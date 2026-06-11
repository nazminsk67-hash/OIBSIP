import crypto from 'crypto'

/**
 * Verify Razorpay payment signature (HMAC SHA256).
 * @see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-5-verify-payment-signature
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false
  }
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false

  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(razorpaySignature, 'hex')
    )
  } catch {
    return expected === razorpaySignature
  }
}
