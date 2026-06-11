import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'
import SEO from '../../components/common/SEO'
import SkipToContent from '../../components/common/SkipToContent'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectAuthLoading } from '../../redux/authSlice'

export default function Register() {
  const { register } = useAuth()
  const loading      = useSelector(selectAuthLoading)

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name)                               errs.name            = 'Name is required'
    if (!form.email)                              errs.email           = 'Email is required'
    if (!form.password)                           errs.password        = 'Password is required'
    if (form.password.length < 6)                 errs.password        = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)   errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const { confirmPassword, ...data } = form
    await register(data)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  return (
    <div className="auth-wrapper relative">
      <SEO
        title="Create Account"
        description="Join PizzaHub to order pizza online, save favorites, and earn loyalty rewards."
        path="/register"
        noIndex
      />
      <SkipToContent targetId="register-form" />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div id="register-form" className="auth-card" tabIndex={-1}>
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3" aria-hidden="true">🍕</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            A verification link will be sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
          <div>
            <label htmlFor="register-name" className="label">Full name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'register-name-error' : undefined}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <p id="register-name-error" className="error-msg" role="alert">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="register-email" className="label">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p id="register-email-error" className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="register-password" className="label">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p id="register-password-error" className="error-msg" role="alert">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="register-confirm" className="label">Confirm password</label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
              className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && <p id="register-confirm-error" className="error-msg" role="alert">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-primary w-full !mt-6"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
