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
    appearance: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    },
  },
  { timestamps: true }
)

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings
