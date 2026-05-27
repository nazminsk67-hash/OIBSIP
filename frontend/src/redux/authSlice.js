import { createSlice } from '@reduxjs/toolkit'

// Hydrate from localStorage on app load
const token = localStorage.getItem('token')
const user  = JSON.parse(localStorage.getItem('user') || 'null')

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  isAdmin: user?.role === 'admin',
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user            = user
      state.token           = token
      state.isAuthenticated = true
      state.isAdmin         = user?.role === 'admin'
      state.error           = null
      // Persist to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.isAdmin         = false
      state.error           = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error   = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAdmin = action.payload?.role === 'admin'
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
  },
})

export const { setCredentials, logout, setLoading, setError, clearError, setUser } = authSlice.actions

// Selectors
export const selectCurrentUser    = (state) => state.auth.user
export const selectToken          = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsAdmin        = (state) => state.auth.isAdmin
export const selectAuthLoading    = (state) => state.auth.loading
export const selectAuthError      = (state) => state.auth.error
export const selectAuthUser       = (state) => state.auth.user

export default authSlice.reducer
