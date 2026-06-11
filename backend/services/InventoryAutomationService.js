import Ingredient from '../models/Ingredient.js'
import Pizza from '../models/Pizza.js'
import Inventory from '../models/Inventory.js'
import { sendLowStockAlert } from '../utils/email.js'
import { notifyAdminLowInventory } from './NotificationService.js'
import { emitStockLow } from '../utils/socket.js'

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Send email only when stock crosses from at/above threshold to below it. */
const maybeSendLowStockAlert = async (ingredient, stockBefore) => {
  console.log('LOW STOCK CHECK')
  console.log('Ingredient:', ingredient.name)
  console.log('Before:', stockBefore)
  console.log('After:', ingredient.stock)
  console.log('Threshold:', ingredient.alertThreshold)

  if (
    stockBefore >= ingredient.alertThreshold &&
    ingredient.stock < ingredient.alertThreshold
  ) {
    console.log('LOW STOCK CONDITION PASSED')

    await sendLowStockAlert(ingredient)

    console.log(`Low stock alert sent for ${ingredient.name}`)
  }
}

/**
 * Process stock reduction for catalog pizza orders.
 * Existing placeOrder logic is moved here without changing behavior.
 */

export const processCatalogOrderStock = async (pizzas) => {
  console.log('PROCESS CATALOG ORDER STOCK CALLED')

  console.log('PIZZAS RECEIVED:')
  console.log(JSON.stringify(pizzas, null, 2))
  const ingredientCount = {}
  const pizzaIds = []

  for (const p of pizzas) {
    const qty = p.quantity || 1
    if (Array.isArray(p.toppings)) {
      for (const t of p.toppings) {
        if (!t.ingredientId) continue
        const id = t.ingredientId.toString()
        ingredientCount[id] = (ingredientCount[id] || 0) + qty
      }
    }
    if (p.pizza) pizzaIds.push(p.pizza)
  }

  if (pizzaIds.length) {
    const pizzasFromDb = await Pizza.find({ _id: { $in: pizzaIds } })
    for (const pizzaDoc of pizzasFromDb) {
      const qty = pizzas.find((p) => p.pizza?.toString() === pizzaDoc._id.toString())?.quantity || 1
      for (const ingId of pizzaDoc.inventoryIngredients || []) {
        const id = ingId.toString()
        ingredientCount[id] = (ingredientCount[id] || 0) + qty
      }
    }
  }

  const ids = Object.keys(ingredientCount)
  if (!ids.length) return { decremented: [], alerts: [] }

  console.log('INGREDIENT COUNT:', ingredientCount)
console.log('IDS:', ids)
  const ingredients = await Ingredient.find({ _id: { $in: ids } })
  console.log('FOUND INGREDIENTS:', ingredients.length)
ingredients.forEach(i => {
  console.log('Ingredient Found:', i.name)
})
  const alerts = []

  for (const ing of ingredients) {
    const dec = ingredientCount[ing._id.toString()] || 0
    const stockBefore = ing.stock
    ing.stock = Math.max(0, ing.stock - dec)
    await ing.save()

    if (ing.stock <= 0) {
      await markPizzasUnavailableForIngredient(ing._id)
    }

    try {
      await maybeSendLowStockAlert(ing, stockBefore)
    } catch (err) {
      console.error('Low stock email error:', err.message)
    }

    if (ing.stock < ing.alertThreshold) {
      alerts.push({ ingredient: ing.name, stock: ing.stock })
      notifyAdminLowInventory(ing.name, ing.stock).catch(() => {})
      emitStockLow(ing.name, ing.stock)
    }

    try {
      await syncAdminInventoryItem(ing.name, dec)
    } catch (err) {
      console.error('Admin inventory sync error:', err.message)
    }
  }

  return { decremented: ids, alerts }
}

/**
 * Process stock reduction for builder-style orders.
 */
export const processBuilderOrderStock = async ({ base, sauce, cheese, veggies = [], quantity = 1 }) => {
  console.log('PROCESS BUILDER ORDER STOCK CALLED')
  const ingredientIds = [
    base?.ingredientId,
    sauce?.ingredientId,
    cheese?.ingredientId,
    ...veggies.map((v) => v.ingredientId),
  ].filter(Boolean)

  const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } })
  const alerts = []

  for (const ing of ingredients) {
    const stockBefore = ing.stock
    ing.stock = Math.max(0, ing.stock - quantity)
    await ing.save()

    if (ing.stock <= 0) {
      await markPizzasUnavailableForIngredient(ing._id)
    }

    try {
      await maybeSendLowStockAlert(ing, stockBefore)
    } catch (err) {
      console.error('Low stock email error:', err.message)
    }

    if (ing.stock < ing.alertThreshold) {
      alerts.push({ ingredient: ing.name, stock: ing.stock })
      notifyAdminLowInventory(ing.name, ing.stock).catch(() => {})
      emitStockLow(ing.name, ing.stock)
    }

    try {
      await syncAdminInventoryItem(ing.name, quantity)
    } catch (err) {
      console.error('Admin inventory sync error:', err.message)
    }
  }

  return { decremented: ingredientIds.map(String), alerts }
}

/**
 * Mirror ingredient decrements onto the admin Inventory collection (matched by name).
 * Status (in-stock / low-stock / out-of-stock) is recalculated via Inventory pre-save hook.
 */
export const syncAdminInventoryItem = async (name, delta) => {
  if (!name || typeof delta !== 'number' || delta <= 0) return null

  const trimmed = String(name).trim()
  if (!trimmed) return null

  const item = await Inventory.findOne({
    name: { $regex: new RegExp(`^${escapeRegExp(trimmed)}$`, 'i') },
  })
  if (!item) return null

  item.stock = Math.max(0, (item.stock || 0) - delta)
  await item.save()
  return item
}

const markPizzasUnavailableForIngredient = async (ingredientId) => {
  await Pizza.updateMany(
    { inventoryIngredients: ingredientId },
    { isAvailable: false }
  )
}

export const checkIngredientAvailability = async (ingredientIds) => {
  const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } })
  return ingredients.every((ing) => ing.stock > 0)
}
