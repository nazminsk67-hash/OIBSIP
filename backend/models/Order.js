import mongoose from 'mongoose'

// Mirrors frontend ORDER_STATUS enum
export const ORDER_STATUS = {
  RECEIVED:  'Order Received',
  KITCHEN:   'In the Kitchen',
  DELIVERY:  'Sent to Delivery',
  DELIVERED: 'Delivered',
}

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },

    // ── Catalog pizzas (array) ───────────────────────────────────
    pizzas: [
      {
        pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
        name: String,
        size: String,
        sizePrice: Number,
        toppings: [
          {
            ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
            name: String,
            extraPrice: Number,
          },
        ],
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],

    // ── Legacy / builder-style pizza fields (kept for compatibility)
    base: {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      name:  String,
      price: Number,
    },
    sauce: {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      name:  String,
      price: Number,
    },
    cheese: {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      name:  String,
      price: Number,
    },
    veggies: [
      {
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
        name:  String,
        price: Number,
      },
    ],
    quantity: {
      type:    Number,
      default: 1,
      min:     1,
    },

    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'cash',
    },
    subtotalPrice: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: String,
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardPointsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnedRewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type:     Number,
      required: true,
    },

    // ── Payment ──────────────────────────────────────────────────
    payment: {
      razorpayOrderId:   String,
      razorpayPaymentId: String,
      razorpaySignature: { type: String, select: false },
      transactionId:     String,
      verifiedAt:        Date,
      status: {
        type:    String,
        enum:    ['pending', 'paid', 'failed', 'verified'],
        default: 'pending',
      },
    },

    // ── Fulfilment ───────────────────────────────────────────────
    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.RECEIVED,
    },

    // ── Real-time lifecycle (additive) ───────────────────────────
    statusHistory: [
      {
        status:    String,
        note:      String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    lastStatusUpdateAt: Date,
  },
  { timestamps: true }
)

orderSchema.pre('save', function initStatusHistory(next) {
  if (this.isNew && (!this.statusHistory || !this.statusHistory.length)) {
    this.statusHistory = [{
      status: this.status || ORDER_STATUS.RECEIVED,
      note: 'Order placed',
      updatedAt: new Date(),
    }]
    this.lastStatusUpdateAt = new Date()
  }
  next()
})

const Order = mongoose.model('Order', orderSchema)
export default Order
