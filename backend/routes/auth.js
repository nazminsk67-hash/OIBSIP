import { Router } from 'express'
import {
  register,
  login,
  adminLogin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { verificationLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.post('/register',                  register)
router.post('/login',                     login)
router.post('/admin/login',               adminLogin)
router.get( '/verify-email/:token',       verificationLimiter, verifyEmail)
router.post('/resend-verification',       verificationLimiter, resendVerification)
router.post('/forgot-password',           forgotPassword)
router.post('/reset-password/:token',     resetPassword)
router.get( '/me',                          protect,      getMe)
router.patch('/me',                         protect,      updateProfile)
router.post( '/me/password',                protect,      changePassword)
router.get( '/favorites',                   protect,      getFavorites)
router.post('/favorites/:pizzaId',          protect,      addFavorite)
router.delete('/favorites/:pizzaId',        protect,      removeFavorite)

export default router
