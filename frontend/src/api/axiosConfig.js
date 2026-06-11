import axios from 'axios'

const defaultBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://pizza-delivery-zjn3.onrender.com/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

// ── Request interceptor ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 429) {
      error.message =
        error.response?.data?.message ||
        'Too many requests. Please wait a moment and try again.'
    }

    if (error.response?.status === 401) {
  console.warn('Unauthorized request:', error.config?.url)

  // Only logout on auth-related routes
  const authRoutes = ['/auth/login', '/auth/register']

  const isAuthRoute = authRoutes.some((route) =>
    error.config?.url?.includes(route)
  )

  if (isAuthRoute) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}

    return Promise.reject(error)
  }
)

export default api