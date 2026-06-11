import { verifyRazorpaySignature } from '../utils/razorpayVerify.js'
import {
  logVerificationSuccess,
  logVerificationFailure,
  logPaymentFailure,
  getPaymentAudits,
} from '../services/PaymentAuditService.js'
import { notifyAdminFailedPayment } from '../services/NotificationService.js'

/**
 * POST /api/orders/verify-payment
 * Verify Razorpay signature before order is marked paid.
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
    } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      await logVerificationFailure({
        user: req.user._id,
        razorpayOrderId,
        razorpayPaymentId,
        message: 'Missing payment verification fields',
        ipAddress: req.ip,
      })
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required',
      })
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    if (!isValid) {
      await logVerificationFailure({
        user: req.user._id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount,
        message: 'Invalid Razorpay signature',
        ipAddress: req.ip,
      })
      notifyAdminFailedPayment(
        req.user._id,
        razorpayOrderId,
        'Payment signature verification failed'
      ).catch(() => {})
      await logPaymentFailure({
        user: req.user._id,
        razorpayOrderId,
        razorpayPaymentId,
        amount,
        message: 'Signature mismatch',
        ipAddress: req.ip,
      })
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Payment verification failed. Order was not marked as paid.',
      })
    }

    await logVerificationSuccess({
      user: req.user._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      message: 'Signature verified successfully',
      ipAddress: req.ip,
    })

    res.json({
      success: true,
      verified: true,
      razorpayOrderId,
      razorpayPaymentId,
      transactionId: razorpayPaymentId,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/payments/audit  (admin)
 */
export const getPaymentAuditLogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500)
    const audits = await getPaymentAudits({
      limit,
      userId: req.query.userId,
      razorpayOrderId: req.query.razorpayOrderId,
    })
    res.json({ success: true, audits, count: audits.length })
  } catch (err) {
    next(err)
  }
}
