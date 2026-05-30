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
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminPizzas = lazy(() => import('./pages/admin/AdminPizzas'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const AdminOrderCenter = lazy(() => import('./pages/admin/AdminOrderCenter'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminDelivery = lazy(() => import('./pages/admin/AdminDelivery'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Favorites = lazy(() => import('./pages/user/Favorites'))
const UserLayout = lazy(() => import('./components/layout/UserLayout'))

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
        <Route path="/" element={<UserLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route index element={<Dashboard />} />
          <Route path="build" element={<PizzaBuilder />} />
          <Route path="pizzas" element={<PizzaList />} />
          <Route path="pizza/:id" element={<PizzaDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="my-orders" element={<OrderStatus />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ── Protected admin routes ────────────────── */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="pizzas" element={<AdminPizzas />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-center" element={<AdminOrderCenter />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="system-health" element={<SystemHealth />} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
