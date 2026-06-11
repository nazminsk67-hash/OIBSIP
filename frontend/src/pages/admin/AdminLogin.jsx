import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectAuthLoading } from '../../redux/authSlice'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const loading        = useSelector(selectAuthLoading)

  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await adminLogin(form)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  return (
    <div className="auth-wrapper relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="auth-card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3" aria-hidden="true">🛡️</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin portal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Restricted access only</p>
        </div>

        <div className="theme-alert-warning rounded-xl p-3 mb-6 text-center">
          <p className="text-xs font-medium">
            This portal is for PizzaHub administrators only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Admin sign in form">
          <div>
            <label htmlFor="admin-email" className="label">Admin email</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@pizzahub.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="admin-password" className="label">Password</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="error-msg" role="alert">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} aria-busy={loading} className="btn-primary w-full !mt-6">
            {loading ? 'Signing in...' : 'Admin sign in'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 space-y-2" style={{ color: 'var(--text-tertiary)' }}>
          <Link to="/forgot-password" className="block" style={{ color: 'var(--accent-primary)' }}>
            Forgot password?
          </Link>
          <Link to="/login" style={{ color: 'var(--accent-primary)' }}>
            ← User login
          </Link>
        </p>
      </div>
    </div>
  )
}
