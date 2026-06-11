import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    general: {
      companyName: { type: String, default: 'PizzaHub' },
      timezone: { type: String, default: 'UTC' },
      supportEmail: { type: String, default: 'support@pizzadelivery.com' },
    },
    payments: {
      razorpayEnabled: { type: Boolean, default: true },
      cashOnDeliveryEnabled: { type: Boolean, default: true },
    },
    notifications: {
      orderAlerts: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
    },
    rewards: {
      enabled: { type: Boolean, default: true },
      pointsPerRupee: { type: Number, default: 1, min: 0 },
      redemptionValuePerPoint: { type: Number, default: 0.5, min: 0 },
      minRedeemPoints: { type: Number, default: 10, min: 0 },
      maxRedeemPercentage: { type: Number, default: 20, min: 0, max: 100 },
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    },
  },
  { timestamps: true }
)

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings
