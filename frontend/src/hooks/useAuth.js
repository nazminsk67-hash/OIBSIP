import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
  setCredentials,
  setLoading,
  setError,
  logout,
} from '../redux/authSlice'
import { fetchFavorites } from '../redux/favoritesSlice'
import { authApi } from '../api/authApi'

export const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const user            = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin         = useSelector(selectIsAdmin)
  const loading         = useSelector(selectAuthLoading)
  const error           = useSelector(selectAuthError)

  const login = async (credentials) => {
    try {
      dispatch(setLoading(true))
      const { data } = await authApi.login(credentials)
      dispatch(setCredentials(data))
      if (data?.user?.role !== 'admin') dispatch(fetchFavorites())
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/pizzas', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      dispatch(setError(msg))
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        const verifyErr = new Error(msg)
        verifyErr.needsVerification = true
        toast.error(msg)
        throw verifyErr
      }
      toast.error(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const adminLogin = async (credentials) => {
    try {
      dispatch(setLoading(true))
      const { data } = await authApi.adminLogin(credentials)
      dispatch(setCredentials(data))
      toast.success('Admin login successful')
      navigate('/admin/analytics', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed'
      dispatch(setError(msg))
      toast.error(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const register = async (userData) => {
    try {
      dispatch(setLoading(true))
      await authApi.register(userData)
      toast.success('Registration successful! Please verify your email.')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      dispatch(setError(msg))
      toast.error(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    adminLogin,
    register,
    logout: handleLogout,
  }
}
