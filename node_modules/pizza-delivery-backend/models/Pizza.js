import mongoose from 'mongoose'

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    image: {
      type: String,          // URL or local path
      default: '',
    },
    tags: [String],          // e.g. ['veg', 'bestseller']
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Pizza = mongoose.model('Pizza', pizzaSchema)
export default Pizza
