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
      <button aria-label="Notifications" onClick={handleOpen} className="relative p-1 rounded hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(markAllRead())} className="text-xs text-gray-500 hover:underline">Mark all</button>
              <button onClick={() => dispatch(clearNotifications())} className="text-xs text-red-500 hover:underline">Clear</button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 border-b hover:bg-gray-50 flex items-start gap-3 ${n.read ? '' : 'bg-white'}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800">{n.title}</div>
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{n.message}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!n.read && (
                    <button onClick={() => handleMark(n.id)} className="text-xs text-primary-600">Mark</button>
                  )}
                  <button onClick={() => dispatch(removeNotification(n.id))} className="text-xs text-gray-400">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
