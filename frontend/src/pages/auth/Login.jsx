import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ThemeToggle from '../../components/common/ThemeToggle'
import SEO from '../../components/common/SEO'
import SkipToContent from '../../components/common/SkipToContent'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectAuthLoading } from '../../redux/authSlice'
import { authApi } from '../../api/authApi'

export default function Login() {
  const { login } = useAuth()
  const loading   = useSelector(selectAuthLoading)

  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)

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
    setNeedsVerification(false)
    try {
      await login(form)
    } catch (err) {
      if (err.needsVerification) {
        setNeedsVerification(true)
      }
    }
  }

  const handleResendVerification = async () => {
    if (!form.email.trim()) {
      toast.error('Enter your email above first')
      return
    }
    try {
      setResending(true)
      await authApi.resendVerification(form.email.trim())
      toast.success('If registered, a verification link was sent to your email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend verification email')
    } finally {
      setResending(false)
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    if (needsVerification) setNeedsVerification(false)
  }

  return (
    <div className="auth-wrapper relative min-h-screen flex items-center justify-center px-4">
      <SEO
        title="Sign In"
        description="Sign in to your PizzaHub account to order pizza, track deliveries, and earn rewards."
        path="/login"
        noIndex
      />
      <SkipToContent targetId="login-form" />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div id="login-form" className="auth-card w-full max-w-md" tabIndex={-1}>
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🍕</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Sign in to order your pizza</p>
        </div>

        {needsVerification && (
          <div
            className="mb-5 rounded-xl border p-4 text-sm"
            style={{
              backgroundColor: 'var(--warning-light)',
              borderColor: 'var(--warning-color)',
              color: 'var(--warning-dark)',
            }}
            role="alert"
          >
            <p className="font-semibold">Please verify your email before logging in</p>
            <p className="mt-1">Check your inbox for the verification link, or resend it below.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-70"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
          <div>
            <label htmlFor="login-email" className="label" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p id="login-email-error" className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="label mb-0" style={{ color: 'var(--text-primary)' }}>Password</label>
              <Link
                to="/forgot-password"
                className="text-xs transition-colors"
                style={{ color: 'var(--accent-primary)' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p id="login-password-error" className="error-msg" role="alert">{errors.password}</p>}
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

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium transition-colors" style={{ color: 'var(--accent-primary)' }}>
            Create one
          </Link>
        </p>

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
