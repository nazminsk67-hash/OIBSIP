import { Router } from 'express'
import {
  register,
  login,
  adminLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register',                  register)
router.post('/login',                     login)
router.post('/admin/login',               adminLogin)
router.get( '/verify-email/:token',       verifyEmail)
router.post('/forgot-password',           forgotPassword)
router.post('/reset-password/:token',     resetPassword)
router.get( '/me',          protect,      getMe)

export default router
