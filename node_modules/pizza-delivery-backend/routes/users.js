import { Router } from 'express'
import {
  getMe,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// User profile endpoints (mirrors /api/auth/* but available under /api/users/* for compatibility)
router.get('/me', protect, getMe)
router.patch('/me', protect, updateProfile)
router.post('/me/password', protect, changePassword)

// Favorites endpoints
router.get('/favorites', protect, getFavorites)
router.post('/favorites/:pizzaId', protect, addFavorite)
router.delete('/favorites/:pizzaId', protect, removeFavorite)

export default router
