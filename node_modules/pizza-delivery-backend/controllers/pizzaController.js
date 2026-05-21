import Pizza      from '../models/Pizza.js'
import Ingredient from '../models/Ingredient.js'
import { sendLowStockAlert } from '../utils/email.js'

// ── GET /api/pizza  – all pizza varieties ──────────────────────────
export const getAllPizzas = async (_req, res, next) => {
  try {
    const pizzas = await Pizza.find({ isAvailable: true }).sort({ createdAt: -1 })
    res.json(pizzas)
  } catch (err) { next(err) }
}

// ── GET /api/pizza/builder-options  – base, sauce, cheese, veggies ─
export const getBuilderOptions = async (_req, res, next) => {
  try {
    const ingredients = await Ingredient.find({ isAvailable: true })
    const grouped = {
      bases:   ingredients.filter(i => i.category === 'base'),
      sauces:  ingredients.filter(i => i.category === 'sauce'),
      cheeses: ingredients.filter(i => i.category === 'cheese'),
      veggies: ingredients.filter(i => i.category === 'veggie'),
      meats:   ingredients.filter(i => i.category === 'meat'),
    }
    res.json(grouped)
  } catch (err) { next(err) }
}

// ── GET /api/pizza/inventory  (admin) ─────────────────────────────
export const getInventory = async (_req, res, next) => {
  try {
    const inventory = await Ingredient.find().sort({ category: 1, name: 1 })
    res.json(inventory)
  } catch (err) { next(err) }
}

// ── PATCH /api/pizza/inventory/:id  (admin) ───────────────────────
export const updateStock = async (req, res, next) => {
  try {
    const { stock, alertThreshold, price, isAvailable } = req.body
    const ingredient = await Ingredient.findById(req.params.id)

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' })
    }

    if (stock           !== undefined) ingredient.stock          = stock
    if (alertThreshold  !== undefined) ingredient.alertThreshold = alertThreshold
    if (price           !== undefined) ingredient.price          = price
    if (isAvailable     !== undefined) ingredient.isAvailable    = isAvailable

    await ingredient.save()

    // Fire low-stock alert email if threshold crossed
    if (ingredient.stock < ingredient.alertThreshold) {
      sendLowStockAlert(ingredient).catch(err =>
        console.error('Low stock email error:', err.message)
      )
    }

    res.json(ingredient)
  } catch (err) { next(err) }
}
