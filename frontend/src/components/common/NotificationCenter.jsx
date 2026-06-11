import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectNotifications,
  selectUnreadCount,
  markRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} from '../../redux/notificationSlice'
import { syncMarketingBroadcasts } from '../../utils/marketingNotifications'
import { syncFromServer } from '../../redux/notificationSlice'
import { notificationApi } from '../../api/notificationApi'
import { selectIsAdmin } from '../../redux/authSlice'

const typeLabel = {
  promo: 'Offer',
  order: 'Order',
  reward: 'Reward',
  coupon: 'Coupon',
  recommendation: 'For you',
  inventory: 'Inventory',
  payment: 'Payment',
  review: 'Review',
  registration: 'User',
  warning: 'Alert',
  alert: 'Update',
  info: 'Info',
}

function formatNotificationDate(iso) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function NotificationCenter() {
  const notifications = useSelector(selectNotifications)
  const unread = useSelector(selectUnreadCount)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      syncMarketingBroadcasts(dispatch)
      try {
        const { data } = isAdmin
          ? await notificationApi.getAdminNotifications({ limit: 50 })
          : await notificationApi.getMyNotifications({ limit: 50 })
        dispatch(syncFromServer(data.notifications || []))
      } catch {
        // Keep local notifications if API unavailable
      }
    }
  }

  const displayItems = isAdmin
    ? notifications
    : (() => {
        const marketingItems = notifications.filter((n) => n.type === 'promo' || n.type === 'info')
        const otherItems = notifications.filter((n) => n.type !== 'promo' && n.type !== 'info')
        return [...marketingItems, ...otherItems]
      })()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={handleOpen}
        className="relative navbar-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 notification-badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-header">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isAdmin ? 'Admin alerts' : 'Updates for you'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {isAdmin
                  ? 'Orders, inventory & system notifications'
                  : 'Offers, rewards & order alerts'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => dispatch(markAllRead())} className="notification-action">
                Mark all read
              </button>
              <button type="button" onClick={() => dispatch(clearNotifications())} className="notification-action" style={{ color: 'var(--danger-color)' }}>
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {displayItems.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No updates yet</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {isAdmin
                    ? 'New orders, low stock, and system alerts will appear here.'
                    : 'Fresh offers and order updates will appear here.'}
                </p>
              </div>
            )}
            {displayItems.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'notification-item-unread' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: 'var(--accent-light)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {typeLabel[n.type] || 'Update'}
                      </span>
                      {!n.read && (
                        <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--accent-primary)' }}>
                          New
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {n.title}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {n.message}
                    </p>
                    <time className="mt-2 block text-xs" style={{ color: 'var(--text-tertiary)' }} dateTime={n.createdAt}>
                      {formatNotificationDate(n.createdAt)}
                    </time>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 justify-end">
                  {!n.read && (
                    <button type="button" onClick={() => dispatch(markRead(n.id))} className="notification-action">
                      Mark read
                    </button>
                  )}
                  <button type="button" onClick={() => dispatch(removeNotification(n.id))} className="notification-action" style={{ color: 'var(--text-tertiary)' }}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
