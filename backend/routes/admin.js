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
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getMarketingAnalytics,
} from '../controllers/adminController.js'
import { getPaymentAuditLogs } from '../controllers/paymentController.js'
import {
  listAdminNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/search', searchGlobal)
router.get('/customers', getAdminCustomers)
router.get('/health', getHealthMetrics)
router.get('/settings', getSettings)
router.put('/settings', updateSettings)
router.get('/audit-logs', getAuditLogs)
router.get('/marketing-analytics', getMarketingAnalytics)
router.get('/inventory', getInventory)
router.post('/inventory', createInventoryItem)
router.put('/inventory/:id', updateInventoryItem)
router.delete('/inventory/:id', deleteInventoryItem)
router.get('/delivery/assignments', getDeliveryAssignments)
router.post('/delivery/assignments', createDeliveryAssignment)
router.patch('/delivery/assignments/:id/status', updateDeliveryAssignmentStatus)

router.get('/payments/audit', getPaymentAuditLogs)
router.get('/notifications', listAdminNotifications)
router.patch('/notifications/read-all', markAllRead)
router.patch('/notifications/:id/read', markRead)

export default router
