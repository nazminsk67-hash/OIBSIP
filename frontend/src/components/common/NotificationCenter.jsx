import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectNotifications, selectUnreadCount, markRead, markAllRead, removeNotification, clearNotifications } from '../../redux/notificationSlice'

export default function NotificationCenter() {
  const notifications = useSelector(selectNotifications)
  const unread = useSelector(selectUnreadCount)
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

  const handleOpen = () => {
    setOpen((v) => !v)
  }

  const handleMark = (id) => {
    dispatch(markRead(id))
  }

  return (
    <div className="relative" ref={ref}>
      <button aria-label="Notifications" onClick={handleOpen} className="relative navbar-button">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 notification-badge">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 notification-panel">
          <div className="notification-header">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(markAllRead())} className="notification-action" style={{ color: 'var(--text-tertiary)' }}>
                Mark all
              </button>
              <button onClick={() => dispatch(clearNotifications())} className="notification-action" style={{ color: 'var(--danger-color)' }}>
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>No notifications</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${!n.read ? 'notification-item-unread' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                <div className="mt-3 flex items-center gap-2 justify-end">
                  {!n.read && (
                    <button onClick={() => handleMark(n.id)} className="notification-action" style={{ color: 'var(--accent-primary)' }}>
                      Mark
                    </button>
                  )}
                  <button onClick={() => dispatch(removeNotification(n.id))} className="notification-action" style={{ color: 'var(--text-tertiary)' }}>
                    Remove
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
