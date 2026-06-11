import React, { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSocket } from './hooks/useSocket'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin } from './redux/authSlice'
import { hydrateForRole, resetNotifications } from './redux/notificationSlice'
import { fetchFavorites } from './redux/favoritesSlice'
import { selectNotifications } from './redux/notificationSlice'
import {
  seedDefaultMarketingNotifications,
  syncMarketingBroadcasts,
} from './utils/marketingNotifications'

// Guards
import ProtectedRoute from './components/common/ProtectedRoute'

// Lazy-loaded pages (route-level code splitting)
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

const PizzaBuilder = lazy(() => import('./pages/user/PizzaBuilder'))
const Cart = lazy(() => import('./pages/user/Cart'))
const Checkout = lazy(() => import('./pages/user/Checkout'))
const OrderStatus = lazy(() => import('./pages/user/OrderStatus'))
const PizzaList = lazy(() => import('./pages/pizza/PizzaList'))
const PizzaDetails = lazy(() => import('./pages/pizza/PizzaDetails'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminPizzas = lazy(() => import('./pages/admin/AdminPizzas'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const AdminOrderCenter = lazy(() => import('./pages/admin/AdminOrderCenter'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminDelivery = lazy(() => import('./pages/admin/AdminDelivery'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'))
const MonitoringDashboard = lazy(() => import('./pages/admin/MonitoringDashboard'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Favorites = lazy(() => import('./pages/user/Favorites'))
const Rewards = lazy(() => import('./pages/user/Rewards'))
const UserLayout = lazy(() => import('./components/layout/UserLayout'))

export default function App() {
  // Initialise socket for authenticated users (handles real-time order status)
  useSocket()

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const notifications = useSelector(selectNotifications)

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      dispatch(resetNotifications())
      return
    }
    dispatch(hydrateForRole(isAdmin ? 'admin' : 'user'))
  }, [isAuthenticated, isAdmin, dispatch])

  useEffect(() => {
    if (!isAuthenticated || isAdmin) return
    dispatch(fetchFavorites())
    syncMarketingBroadcasts(dispatch)
  }, [isAuthenticated, isAdmin, dispatch])

  useEffect(() => {
    if (!isAuthenticated || isAdmin) return
    if (notifications.length === 0) {
      seedDefaultMarketingNotifications(dispatch, 0)
    }
  }, [isAuthenticated, isAdmin, notifications.length, dispatch])

  return (
    <Suspense fallback={null}>
      <Routes>
      {/* ── Public routes ─────────────────────────── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/analytics' : '/pizzas'} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/pizzas" replace /> : <Register />}
      />
      <Route path="/forgot-password"        element={<ForgotPassword />} />
      <Route path="/reset-password/:token"  element={<ResetPassword />} />
      <Route path="/verify-email/:token"    element={<VerifyEmail />} />
      <Route path="/admin/login"            element={<AdminLogin />} />

      {/* ── Protected user routes ─────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<UserLayout />}>
          <Route path="dashboard" element={<Navigate to="/pizzas" replace />} />
          <Route index element={<Navigate to="/pizzas" replace />} />
          <Route path="build" element={<PizzaBuilder />} />
          <Route path="build-pizza" element={<PizzaBuilder />} />
          <Route path="pizzas" element={<PizzaList />} />
          <Route path="pizza/:id" element={<PizzaDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="my-orders" element={<OrderStatus />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ── Protected admin routes ────────────────── */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/analytics" replace />} />
          <Route path="dashboard" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="pizzas" element={<AdminPizzas />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-center" element={<AdminOrderCenter />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="monitoring" element={<MonitoringDashboard />} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/pizzas" replace />} />
      <Route path="*"  element={<Navigate to="/pizzas" replace />} />
      </Routes>
    </Suspense>
  )
}
