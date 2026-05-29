import { Router } from 'express'
import {
  getAllPizzas,
  getBuilderOptions,
  getInventory,
  updateStock,
  getPizzaById,
  getPizzasByCategory,
  getAllPizzasAdmin,
  createPizza,
  updatePizza,
  deletePizza,
} from '../controllers/pizzaController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Public / user routes
router.get('/',                   getAllPizzas)
router.get('/builder-options',    getBuilderOptions)
router.get('/category/:category', getPizzasByCategory)

// Admin-only routes
router.get('/admin/all',          protect, adminOnly, getAllPizzasAdmin)
router.get('/inventory',          protect, adminOnly, getInventory)
router.patch('/inventory/:id',    protect, adminOnly, updateStock)
router.post( '/admin',            protect, adminOnly, createPizza)
router.put(  '/admin/:id',        protect, adminOnly, updatePizza)
router.delete('/admin/:id',       protect, adminOnly, deletePizza)

router.get('/:id',                getPizzaById)

export default router
