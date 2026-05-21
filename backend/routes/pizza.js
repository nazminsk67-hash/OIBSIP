import { Router } from 'express'
import {
  getAllPizzas,
  getBuilderOptions,
  getInventory,
  updateStock,
} from '../controllers/pizzaController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Public / user routes
router.get('/',                getAllPizzas)
router.get('/builder-options', getBuilderOptions)

// Admin-only routes
router.get(  '/inventory',        protect, adminOnly, getInventory)
router.patch('/inventory/:id',    protect, adminOnly, updateStock)

export default router
