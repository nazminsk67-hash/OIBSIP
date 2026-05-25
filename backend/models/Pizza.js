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
    image: {
      type: String, // URL or CDN path
      default: '',
    },
    category: {
      type: String,
      default: 'classic',
      index: true,
    },

    // Sizes and their prices, e.g. [{ name: 'Small', price: 199 }, ...]
    sizes: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    // Toppings that can be added to this pizza (optional)
    toppings: [
      {
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
        name: String,
        extraPrice: { type: Number, default: 0 },
      },
    ],

    // Inventory integration: optional mapping to a base ingredient set
    inventoryIngredients: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Pizza = mongoose.model('Pizza', pizzaSchema)
export default Pizza
