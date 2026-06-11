import { Router } from 'express'
import {
  getReviewsByPizza,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  hideReview,
  restoreReview,
  toggleFeaturedReview,
} from '../controllers/reviewController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/pizza/:pizzaId', getReviewsByPizza)
router.get('/me', protect, getMyReviews)
router.post('/', protect, createReview)
router.put('/:id', protect, updateReview)
router.delete('/:id', protect, deleteReview)

router.get('/admin/all', protect, adminOnly, getAllReviews)
router.patch('/admin/:id/hide', protect, adminOnly, hideReview)
router.patch('/admin/:id/restore', protect, adminOnly, restoreReview)
router.patch('/admin/:id/featured', protect, adminOnly, toggleFeaturedReview)

export default router
