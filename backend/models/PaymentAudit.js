import mongoose from 'mongoose'

const paymentAuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    event: {
      type: String,
      enum: [
        'payment_initiated',
        'payment_success',
        'payment_failure',
        'verification_success',
        'verification_failure',
        'order_placed_paid',
        'order_placed_pending',
      ],
      required: true,
    },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: { type: String, select: false },
    amount:            Number,
    currency:          { type: String, default: 'INR' },
    paymentStatus:     String,
    message:           String,
    metadata:          mongoose.Schema.Types.Mixed,
    ipAddress:         String,
  },
  { timestamps: true }
)

paymentAuditSchema.index({ createdAt: -1 })
paymentAuditSchema.index({ razorpayOrderId: 1 })
paymentAuditSchema.index({ user: 1 })

const PaymentAudit = mongoose.model('PaymentAudit', paymentAuditSchema)
export default PaymentAudit
