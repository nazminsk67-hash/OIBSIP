import { Routes, Route, Navigate } from 'react-router-dom'
import { useSocket } from './hooks/useSocket'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './redux/authSlice'

// Guards
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth pages
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'
import VerifyEmail    from './pages/auth/VerifyEmail'

// User pages
import Dashboard   from './pages/user/Dashboard'
import PizzaBuilder from './pages/user/PizzaBuilder'
import Cart        from './pages/user/Cart'
import Checkout    from './pages/user/Checkout'
import OrderStatus from './pages/user/OrderStatus'

// Admin pages
import AdminLogin     from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import Inventory      from './pages/admin/Inventory'
import Orders         from './pages/admin/Orders'

export default function App() {
  // Initialise socket for authenticated users (handles real-time order status)
  useSocket()

  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/forgot-password"        element={<ForgotPassword />} />
      <Route path="/reset-password/:token"  element={<ResetPassword />} />
      <Route path="/verify-email/:token"    element={<VerifyEmail />} />
      <Route path="/admin/login"            element={<AdminLogin />} />

      {/* ── Protected user routes ─────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/build"       element={<PizzaBuilder />} />
        <Route path="/cart"        element={<Cart />} />
        <Route path="/checkout"    element={<Checkout />} />
        <Route path="/my-orders"   element={<OrderStatus />} />
      </Route>

      {/* ── Protected admin routes ────────────────── */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/orders"    element={<Orders />} />
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
