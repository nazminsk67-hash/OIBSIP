import { Router } from 'express'
import {
  searchGlobal,
  getAdminCustomers,
  getHealthMetrics,
  getSettings,
  updateSettings,
  getAuditLogs,
  getDeliveryAssignments,
  createDeliveryAssignment,
  updateDeliveryAssignmentStatus,
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/search', searchGlobal)
router.get('/customers', getAdminCustomers)
router.get('/health', getHealthMetrics)
router.get('/settings', getSettings)
router.put('/settings', updateSettings)
router.get('/audit-logs', getAuditLogs)
router.get('/delivery/assignments', getDeliveryAssignments)
router.post('/delivery/assignments', createDeliveryAssignment)
router.patch('/delivery/assignments/:id/status', updateDeliveryAssignmentStatus)

export default router
