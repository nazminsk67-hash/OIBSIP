import mongoose from 'mongoose'

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earn', 'redeem'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: [0, 'Points must be positive'],
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount must be positive'],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema)
export default RewardTransaction
