import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
} from '../../redux/authSlice'
import Loader from './Loader'

export default function ProtectedRoute({ adminOnly = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const loading = useSelector(selectAuthLoading)
  const location = useLocation()

  // Prevent redirect during auth restoration/loading
  if (loading) {
    return <Loader />
  }

  // Double-check localStorage fallback
  const token = localStorage.getItem('token')

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}