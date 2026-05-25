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

    // ── Pricing ─────────────────────────────────────────────────
    totalPrice: {
      type:     Number,
      required: true,
    },

    // ── Payment ──────────────────────────────────────────────────
    payment: {
      razorpayOrderId:   String,
      razorpayPaymentId: String,
      status: {
        type:    String,
        enum:    ['pending', 'paid', 'failed'],
        default: 'pending',
      },
    },

    // ── Fulfilment ───────────────────────────────────────────────
    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.RECEIVED,
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
