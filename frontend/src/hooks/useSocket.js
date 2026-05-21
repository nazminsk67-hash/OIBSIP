import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { updateOrderStatus } from '../redux/orderSlice'
import { selectToken, selectIsAuthenticated } from '../redux/authSlice'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export const useSocket = () => {
  const dispatch        = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token           = useSelector(selectToken)
  const socketRef       = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    // Connect with auth token
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    // Listen for order status updates from admin
    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      dispatch(updateOrderStatus({ orderId, status }))
      toast.success(`Order update: ${status}`, { icon: '🍕' })
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
  }, [isAuthenticated, token, dispatch])

  return socketRef.current
}
