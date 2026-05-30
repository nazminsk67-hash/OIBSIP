import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectAuthLoading } from '../../redux/authSlice'

export default function Login() {
  const { login } = useAuth()
  const loading   = useSelector(selectAuthLoading)

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
    await login(form)
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
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🍕</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Sign in to order your pizza</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              aria-label="Email address"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0" style={{ color: 'var(--text-primary)' }}>Password</label>
              <Link
                to="/forgot-password"
                className="text-xs transition-colors"
                style={{ color: 'var(--accent-primary)' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              aria-label="Password"
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="error-msg" role="alert">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium transition-colors" style={{ color: 'var(--accent-primary)' }}>
            Create one
          </Link>
        </p>

        {/* Admin link */}
        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
          <Link
            to="/admin/login"
            className="text-xs transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Admin login →
          </Link>
        </div>
      </div>
    </div>
  )
}
