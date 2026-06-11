import { Router } from 'express'
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  activateCoupon,
  getCouponById,
  getCouponUsage,
  validateCoupon,
  getActiveCoupons,
} from '../controllers/couponController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.post('/validate', protect, validateCoupon)
router.get('/active', protect, getActiveCoupons)

router.use(protect, adminOnly)
router.get('/', getAllCoupons)
router.post('/', createCoupon)
router.get('/:id', getCouponById)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)
router.patch('/:id/activate', activateCoupon)
router.get('/:id/usage', getCouponUsage)

export default router
