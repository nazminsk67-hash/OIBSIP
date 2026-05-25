import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin } from '../../redux/authSlice'
import Loader from './Loader'

// Usage:
// <ProtectedRoute />                 → requires login
// <ProtectedRoute adminOnly />       → requires admin role
export default function ProtectedRoute({ adminOnly = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin         = useSelector(selectIsAdmin)
  const location        = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
