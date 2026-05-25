import mongoose from 'mongoose'

/**
 * A single ingredient / topping used in the pizza builder.
 * category drives which step it appears in:
 *   base | sauce | cheese | veggie | meat
 */
const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    // threshold below which admin gets an email alert
    alertThreshold: {
      type: Number,
      default: 20,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Ingredient = mongoose.model('Ingredient', ingredientSchema)
export default Ingredient
