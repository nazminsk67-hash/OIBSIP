import { Router } from 'express'
import {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// All order routes require authentication
router.use(protect)

// User routes
router.post('/create-payment',  createRazorpayOrder)
router.post('/place',           placeOrder)
router.get( '/my-orders',       getMyOrders)

// Admin-only routes MUST come before generic :id route
router.get(   '/admin/all',        adminOnly, getAllOrders)
router.put(   '/admin/:id/status', adminOnly, updateOrderStatus)
router.patch( '/admin/:id/status', adminOnly, updateOrderStatus)

// Generic routes come last (match :id parameter)
router.get( '/:id',             getOrderById)
router.get( '/',                 adminOnly, getAllOrders)

export default router
