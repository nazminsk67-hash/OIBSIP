import {
  getUserNotifications,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/NotificationService.js'

export const listMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100)
    const unreadOnly = req.query.unread === 'true'
    const items = await getUserNotifications(req.user._id, { limit, unreadOnly })
    res.json({
      success: true,
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
    })
  } catch (err) {
    next(err)
  }
}

export const listAdminNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100)
    const items = await getAdminNotifications({ limit })
    res.json({
      success: true,
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
    })
  } catch (err) {
    next(err)
  }
}

export const markRead = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const doc = await markNotificationRead(req.params.id, req.user._id, isAdmin)
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    res.json({ success: true, notification: doc })
  } catch (err) {
    next(err)
  }
}

export const markAllRead = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    await markAllNotificationsRead(req.user._id, isAdmin)
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}
