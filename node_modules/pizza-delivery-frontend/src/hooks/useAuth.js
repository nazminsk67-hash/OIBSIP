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
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      dispatch(setError(msg))
      toast.error(msg)
    }
  }

  const adminLogin = async (credentials) => {
    try {
      dispatch(setLoading(true))
      const { data } = await authApi.adminLogin(credentials)
      dispatch(setCredentials(data))
      toast.success('Admin login successful')
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed'
      dispatch(setError(msg))
      toast.error(msg)
    }
  }

  const register = async (userData) => {
    try {
      dispatch(setLoading(true))
      await authApi.register(userData)
      toast.success('Registration successful! Please verify your email.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      dispatch(setError(msg))
      toast.error(msg)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
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
