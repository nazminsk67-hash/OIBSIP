import PaymentAudit from '../models/PaymentAudit.js'
import logger from '../utils/logger.js'

const log = async (payload) => {
  try {
    const entry = await PaymentAudit.create(payload)
    logger.info(`Payment audit: ${payload.event}`, {
      auditId: entry._id,
      razorpayOrderId: payload.razorpayOrderId,
    })
    return entry
  } catch (err) {
    logger.error('PaymentAuditService log failed', { error: err.message })
    return null
  }
}

export const logPaymentInitiated = (data) =>
  log({ event: 'payment_initiated', ...data })

export const logPaymentSuccess = (data) =>
  log({ event: 'payment_success', paymentStatus: 'paid', ...data })

export const logPaymentFailure = (data) =>
  log({ event: 'payment_failure', paymentStatus: 'failed', ...data })

export const logVerificationSuccess = (data) =>
  log({ event: 'verification_success', paymentStatus: 'verified', ...data })

export const logVerificationFailure = (data) =>
  log({ event: 'verification_failure', paymentStatus: 'failed', ...data })

export const logOrderPlacedPaid = (data) =>
  log({ event: 'order_placed_paid', paymentStatus: 'paid', ...data })

export const logOrderPlacedPending = (data) =>
  log({ event: 'order_placed_pending', paymentStatus: 'pending', ...data })

export const getPaymentAudits = async ({ limit = 100, userId, razorpayOrderId } = {}) => {
  const filter = {}
  if (userId) filter.user = userId
  if (razorpayOrderId) filter.razorpayOrderId = razorpayOrderId
  return PaymentAudit.find(filter)
    .populate('user', 'name email')
    .populate('order', '_id totalPrice status')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

export const getPaymentAuditById = async (id) =>
  PaymentAudit.findById(id)
    .populate('user', 'name email')
    .populate('order', '_id totalPrice status payment')
    .lean()
