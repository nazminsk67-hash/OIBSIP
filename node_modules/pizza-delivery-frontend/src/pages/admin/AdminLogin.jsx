import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🛡️</span>
          <h1 className="text-2xl font-bold text-gray-900">Admin portal</h1>
          <p className="text-sm text-gray-500 mt-1">Restricted access only</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-center">
          <p className="text-amber-700 text-xs font-medium">
            This portal is for PizzaHub administrators only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Admin email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@pizzahub.com"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
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

          <button type="submit" disabled={loading} className="btn-primary w-full !mt-6">
            {loading ? 'Signing in...' : 'Admin sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-500 hover:text-primary-600">
            ← User login
          </Link>
        </p>
      </div>
    </div>
  )
}
