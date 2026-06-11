/** Admin-only notification types (DB + socket). */
export const ADMIN_NOTIFICATION_TYPES = new Set([
  'inventory',
  'payment',
  'review',
  'registration',
  'alert',
  'warning',
])

/** Customer-facing notification types. */
export const USER_NOTIFICATION_TYPES = new Set([
  'promo',
  'order',
  'reward',
  'coupon',
  'recommendation',
  'info',
])

/** Socket events delivered only to the admin room. */
export const ADMIN_SOCKET_EVENTS = new Set([
  'orderPlaced',
  'stockLow',
  'adminAlert',
])

/** Socket events delivered only to customer user rooms. */
export const USER_SOCKET_EVENTS = new Set([
  'orderStatusUpdated',
  'orderDelivered',
])

const adminAudience = (n) => n?.audience === 'admin'
const userAudience = (n) => n?.audience === 'user' || n?.audience === 'broadcast'

export const isAdminNotification = (notification) => {
  if (!notification) return false
  if (adminAudience(notification)) return true
  if (userAudience(notification)) return false
  return ADMIN_NOTIFICATION_TYPES.has(notification.type)
}

export const isUserNotification = (notification) => {
  if (!notification) return false
  if (userAudience(notification)) return true
  if (adminAudience(notification)) return false
  if (ADMIN_NOTIFICATION_TYPES.has(notification.type)) return false
  return USER_NOTIFICATION_TYPES.has(notification.type)
}

export const shouldAcceptNotification = (notification, isAdmin) =>
  isAdmin ? isAdminNotification(notification) : isUserNotification(notification)

export const shouldHandleSocketEvent = (event, isAdmin) => {
  if (ADMIN_SOCKET_EVENTS.has(event)) return isAdmin
  if (USER_SOCKET_EVENTS.has(event)) return !isAdmin
  if (event === 'notification') return true
  return false
}

export const filterNotificationsForRole = (items, isAdmin) =>
  (items || []).filter((n) => shouldAcceptNotification(n, isAdmin))
