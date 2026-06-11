import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    audience: {
      type: String,
      enum: ['user', 'admin', 'broadcast'],
      default: 'user',
    },
    type: {
      type: String,
      enum: [
        'promo',
        'order',
        'reward',
        'coupon',
        'inventory',
        'payment',
        'review',
        'registration',
        'recommendation',
        'warning',
        'info',
        'alert',
      ],
      default: 'info',
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    emoji:   { type: String, default: '🔔' },
    read:    { type: Boolean, default: false },
    data:    mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ audience: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
