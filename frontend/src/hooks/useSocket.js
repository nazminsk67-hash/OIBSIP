import { selectIsAdmin } from '../redux/authSlice'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { updateOrderStatus } from '../redux/orderSlice'
import { addNotification } from '../redux/notificationSlice'

const selectNotificationRole = (state) => state.notifications.role
import { selectToken, selectIsAuthenticated } from '../redux/authSlice'
import {
  shouldAcceptNotification,
  shouldHandleSocketEvent,
} from '../utils/notificationFilters'

const resolveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) return apiUrl.replace(/\/api\/?$/, '')
  if (import.meta.env.DEV) return 'http://localhost:5000'
  return 'https://pizza-delivery-zjn3.onrender.com'
}

const SOCKET_URL = resolveSocketUrl()

export const useSocket = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)
  const isAdmin = useSelector(selectIsAdmin)
  const notificationRole = useSelector(selectNotificationRole)
  const socketRef = useRef(null)
  useEffect(() => {
    if (!isAuthenticated || !token || !notificationRole) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    const socket = socketRef.current

    const pushNotification = (payload, overrides = {}) => {
      const item = {
        type: payload.type || overrides.type || 'info',
        title: payload.emoji ? `${payload.emoji} ${payload.title}` : (payload.title || overrides.title || ''),
        message: payload.message || overrides.message || '',
        data: payload.data ?? overrides.data ?? payload,
        audience: payload.audience || overrides.audience || (isAdmin ? 'admin' : 'user'),
      }
      if (!item.title || !shouldAcceptNotification(item, isAdmin)) return
      dispatch(addNotification(item))
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('orderStatusUpdated', (payload) => {
      if (!shouldHandleSocketEvent('orderStatusUpdated', isAdmin)) return
      const { orderId, status, statusHistory, lastStatusUpdateAt } = payload
      dispatch(updateOrderStatus({ orderId, status, statusHistory, lastStatusUpdateAt }))
      toast.success(`Order update: ${status}`, { icon: '🍕' })
      pushNotification(payload, {
        type: 'order',
        audience: 'user',
        title: `Order ${String(orderId).slice(-8).toUpperCase()} updated`,
        message: `Status changed to ${status}`,
        data: { orderId, status },
      })
    })

    socket.on('notification', (payload) => {
      if (!shouldHandleSocketEvent('notification', isAdmin)) return
      if (!payload?.title) return
      pushNotification(payload)
    })

    socket.on('orderPlaced', (payload) => {
      if (!shouldHandleSocketEvent('orderPlaced', isAdmin)) return
      const { orderId, short } = payload || {}
      toast.success('New order placed', { icon: '🧾' })
      pushNotification(payload, {
        type: 'order',
        audience: 'admin',
        title: `New order ${orderId}`,
        message: short || 'A new order was placed',
      })
    })

    socket.on('orderDelivered', (payload) => {
      if (!shouldHandleSocketEvent('orderDelivered', isAdmin)) return
      const { orderId } = payload || {}
      toast.success('Order delivered 🎉', { icon: '🚚' })
      pushNotification(payload, {
        type: 'order',
        audience: 'user',
        title: `Order ${orderId} delivered`,
        message: 'Order has been delivered',
      })
    })

    socket.on('stockLow', (payload) => {
      if (!shouldHandleSocketEvent('stockLow', isAdmin)) return
      const { ingredient, remaining } = payload || {}
      toast.error(`Low stock: ${ingredient}`, { icon: '⚠️' })
      pushNotification(payload, {
        type: 'inventory',
        audience: 'admin',
        title: `Low stock: ${ingredient}`,
        message: `Remaining: ${remaining}`,
      })
    })

    socket.on('adminAlert', (payload) => {
      if (!shouldHandleSocketEvent('adminAlert', isAdmin)) return
      const { title, message } = payload || {}
      toast.info(`${title ? `${title}: ` : ''}${message || 'Admin message'}`)
      pushNotification(payload, {
        type: 'alert',
        audience: 'admin',
        title: title || 'Admin Alert',
        message: message || '',
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, token, notificationRole, dispatch, isAdmin])

  return socketRef.current
}
