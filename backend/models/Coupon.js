import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [0, 'Coupon value must be positive'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Maximum discount cannot be negative'],
    },
    expiryDate: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: [0, 'Usage limit cannot be negative'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [0, 'Per-user limit cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usageHistory: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        discountApplied: Number,
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon
