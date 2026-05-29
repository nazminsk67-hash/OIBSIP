/**
 * Run once to populate MongoDB with starter data.
 *   node utils/seed.js
 */
import 'dotenv/config'
import mongoose   from 'mongoose'
import User       from '../models/User.js'
import Ingredient from '../models/Ingredient.js'
import Pizza      from '../models/Pizza.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected to MongoDB')

// ── Clean slate ───────────────────────────────────────────────────
await Promise.all([
  User.deleteMany({}),
  Ingredient.deleteMany({}),
  Pizza.deleteMany({}),
])

// ── Admin user ────────────────────────────────────────────────────
const admin = await User.create({
  name:            'Admin',
  email:           'admin@pizza.com',
  password:        'Admin@1234',
  role:            'admin',
  isEmailVerified: true,
})
console.log(`👤  Admin created: ${admin.email}  /  Admin@1234`)

// ── Ingredients ───────────────────────────────────────────────────
const ingredients = await Ingredient.insertMany([
  // Bases (5)
  { name: 'Thin Crust',      category: 'base',   price: 49,  stock: 80, alertThreshold: 20 },
  { name: 'Thick Crust',     category: 'base',   price: 59,  stock: 80, alertThreshold: 20 },
  { name: 'Cheese Burst',    category: 'base',   price: 79,  stock: 60, alertThreshold: 15 },
  { name: 'Whole Wheat',     category: 'base',   price: 69,  stock: 70, alertThreshold: 20 },
  { name: 'Gluten Free',     category: 'base',   price: 89,  stock: 50, alertThreshold: 15 },

  // Sauces (5)
  { name: 'Tomato Marinara', category: 'sauce',  price: 29,  stock: 100, alertThreshold: 20 },
  { name: 'BBQ',             category: 'sauce',  price: 35,  stock: 90,  alertThreshold: 20 },
  { name: 'Pesto',           category: 'sauce',  price: 39,  stock: 80,  alertThreshold: 20 },
  { name: 'White Garlic',    category: 'sauce',  price: 32,  stock: 85,  alertThreshold: 20 },
  { name: 'Spicy Arrabiata', category: 'sauce',  price: 30,  stock: 90,  alertThreshold: 20 },

  // Cheeses (5)
  { name: 'Mozzarella',      category: 'cheese', price: 49,  stock: 80,  alertThreshold: 20 },
  { name: 'Cheddar',         category: 'cheese', price: 59,  stock: 70,  alertThreshold: 15 },
  { name: 'Parmesan',        category: 'cheese', price: 65,  stock: 60,  alertThreshold: 15 },
  { name: 'Vegan Cheese',    category: 'cheese', price: 79,  stock: 50,  alertThreshold: 15 },
  { name: 'Double Cheese',   category: 'cheese', price: 89,  stock: 40,  alertThreshold: 10 },

  // Veggies
  { name: 'Bell Peppers',    category: 'veggie', price: 19,  stock: 100, alertThreshold: 20 },
  { name: 'Onions',          category: 'veggie', price: 15,  stock: 120, alertThreshold: 20 },
  { name: 'Mushrooms',       category: 'veggie', price: 25,  stock: 90,  alertThreshold: 20 },
  { name: 'Olives',          category: 'veggie', price: 29,  stock: 80,  alertThreshold: 20 },
  { name: 'Jalapeños',       category: 'veggie', price: 20,  stock: 70,  alertThreshold: 20 },
  { name: 'Corn',            category: 'veggie', price: 18,  stock: 110, alertThreshold: 20 },
  { name: 'Spinach',         category: 'veggie', price: 22,  stock: 85,  alertThreshold: 20 },
  { name: 'Sun-dried Tomato',category: 'veggie', price: 35,  stock: 60,  alertThreshold: 15 },

  // Meats
  { name: 'Chicken',         category: 'meat',   price: 79,  stock: 60,  alertThreshold: 15 },
  { name: 'Pepperoni',       category: 'meat',   price: 89,  stock: 50,  alertThreshold: 15 },
  { name: 'Sausage',         category: 'meat',   price: 85,  stock: 55,  alertThreshold: 15 },
])
console.log(`🧀  ${ingredients.length} ingredients seeded`)

// ── Pizza varieties ───────────────────────────────────────────────
await Pizza.insertMany([
  {
    name:        'Margherita Classic',
    description: 'A timeless classic with rich tomato sauce and creamy mozzarella.',
    basePrice:   199,
    tags:        ['veg', 'bestseller'],
  },
  {
    name:        'Pepperoni Paradise',
    description: 'Loaded with premium pepperoni and oozing mozzarella.',
    basePrice:   299,
    tags:        ['non-veg', 'bestseller'],
  },
  {
    name:        'BBQ Chicken Delight',
    description: 'Smoky BBQ sauce, grilled chicken, red onions, and cheddar.',
    basePrice:   329,
    tags:        ['non-veg'],
  },
  {
    name:        'Veggie Supreme',
    description: 'Colourful bell peppers, mushrooms, olives, corn, and jalapeños.',
    basePrice:   249,
    tags:        ['veg'],
  },
  {
    name:        'Pesto Garden',
    description: 'Basil pesto, fresh spinach, sun-dried tomatoes, and parmesan.',
    basePrice:   269,
    tags:        ['veg'],
  },
  {
    name:        'Spicy Arrabiata',
    description: 'Fiery arrabiata sauce, jalapeños, chicken sausage, and mozzarella.',
    basePrice:   319,
    tags:        ['non-veg', 'spicy'],
  },
])
console.log('🍕  Pizza varieties seeded')

await mongoose.disconnect()
console.log('\n✅  Seed complete! You can now start the server.\n')
