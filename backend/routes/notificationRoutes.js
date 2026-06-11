import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  listMyNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js'

const router = Router()

router.use(protect)

router.get('/', listMyNotifications)
router.patch('/read-all', markAllRead)
router.patch('/:id/read', markRead)

export default router
