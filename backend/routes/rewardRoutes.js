import { Router } from 'express'
import { getRewardSummary, getRewardHistory } from '../controllers/rewardController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.get('/', getRewardSummary)
router.get('/history', getRewardHistory)

export default router
