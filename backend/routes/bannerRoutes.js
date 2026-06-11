import { Router } from 'express'
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  trackBannerClick,
  getBannerStats,
} from '../controllers/bannerController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/active', getActiveBanners)
router.post('/click/:bannerId', protect, trackBannerClick)

router.use(protect, adminOnly)
router.get('/admin/stats', getBannerStats)
router.get('/', getAllBanners)
router.post('/', createBanner)
router.put('/:id', updateBanner)
router.delete('/:id', deleteBanner)

export default router
