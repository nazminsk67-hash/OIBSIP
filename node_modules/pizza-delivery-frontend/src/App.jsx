import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSocket } from './hooks/useSocket'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated } from './redux/authSlice'
import { fetchFavorites } from './redux/favoritesSlice'

// Guards
import ProtectedRoute from './components/common/ProtectedRoute'

// Lazy-loaded pages (route-level code splitting)
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

const Dashboard = lazy(() => import('./pages/user/Dashboard'))
const PizzaBuilder = lazy(() => import('./pages/user/PizzaBuilder'))
const Cart = lazy(() => import('./pages/user/Cart'))
const Checkout = lazy(() => import('./pages/user/Checkout'))
const OrderStatus = lazy(() => import('./pages/user/OrderStatus'))
const PizzaList = lazy(() => import('./pages/pizza/PizzaList'))
const PizzaDetails = lazy(() => import('./pages/pizza/PizzaDetails'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminPizzas = lazy(() => import('./pages/admin/AdminPizzas'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Favorites = lazy(() => import('./pages/user/Favorites'))

export default function App() {
  // Initialise socket for authenticated users (handles real-time order status)
  useSocket()

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Restore favorites on app mount when authenticated
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavorites())
  }, [isAuthenticated, dispatch])

  return (
    <Suspense fallback={null}>
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
        <Route path="/pizzas"      element={<PizzaList />} />
        <Route path="/pizza/:id"    element={<PizzaDetails />} />
        <Route path="/cart"        element={<Cart />} />
        <Route path="/checkout"    element={<Checkout />} />
        <Route path="/my-orders"   element={<OrderStatus />} />
        <Route path="/favorites"   element={<Favorites />} />
        <Route path="/profile"     element={<Profile />} />
      </Route>

      {/* ── Protected admin routes ────────────────── */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pizzas"    element={<AdminPizzas />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/orders"    element={<Orders />} />
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
