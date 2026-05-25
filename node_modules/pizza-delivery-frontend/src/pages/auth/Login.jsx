import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🍕</span>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to order your pizza</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-500 hover:text-primary-600"
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
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
            Create one
          </Link>
        </p>

        {/* Admin link */}
        <div className="border-t border-gray-100 pt-4 mt-4 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Admin login →
          </Link>
        </div>
      </div>
    </div>
  )
}
