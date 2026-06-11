import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const STATUS_PRIORITY = {
  loading: 0,
  invalid: 1,
  expired: 2,
  already_verified: 3,
  success: 4,
}

const resolveStatus = (data, httpStatus) => {
  if (data?.code === 'EMAIL_VERIFIED' || (data?.success === true && httpStatus === 200)) {
    return 'success'
  }
  if (data?.code === 'ALREADY_VERIFIED' || httpStatus === 208) {
    return 'already_verified'
  }
  if (data?.code === 'TOKEN_EXPIRED') return 'expired'
  if (data?.code === 'TOKEN_INVALID') return 'invalid'
  return 'invalid'
}

const resolveStatusFromError = (err) => {
  const status = err.response?.status
  const code = err.response?.data?.code

  if (status === 429) {
    toast.error(err.response?.data?.message || 'Too many requests. Please wait and try again.')
    return 'expired'
  }
  if (status === 410 || code === 'TOKEN_EXPIRED') return 'expired'
  if (status === 400 || code === 'TOKEN_INVALID') return 'invalid'
  if (status === 208 || code === 'ALREADY_VERIFIED') return 'already_verified'
  return 'invalid'
}

const applyStatus = (setter, next) => {
  setter((prev) => {
    const prevRank = STATUS_PRIORITY[prev] ?? 0
    const nextRank = STATUS_PRIORITY[next] ?? 0
    return nextRank >= prevRank ? next : prev
  })
}

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    let active = true

    const verify = async () => {
      try {
        const response = await authApi.verifyEmail(token)
        if (!active) return
        applyStatus(setStatus, resolveStatus(response.data, response.status))
      } catch (err) {
        if (!active) return
        applyStatus(setStatus, resolveStatusFromError(err))
      }
    }

    verify()
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (status !== 'success' && status !== 'already_verified') return
    const timer = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(timer)
  }, [status, navigate])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail.trim()) {
      toast.error('Enter your email address')
      return
    }
    try {
      setResending(true)
      await authApi.resendVerification(resendEmail.trim())
      toast.success('If registered, a new verification link was sent.')
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data?.message || 'Too many requests. Please wait and try again.')
      } else {
        toast.error(err.response?.data?.message || 'Unable to resend verification email')
      }
    } finally {
      setResending(false)
    }
  }

  const showResendForm = status === 'expired' || status === 'invalid'

  return (
    <div className="auth-wrapper">
      <div className="auth-card text-center">
        {status === 'loading' && (
          <>
            <Loader size="lg" />
            <p className="text-gray-500 mt-4">Verifying email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="text-6xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified successfully</h2>
            <p className="text-gray-500 mb-6">
              Your account is active. You can sign in and start ordering.
              Redirecting to login…
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <span className="text-6xl block mb-4">ℹ️</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified successfully</h2>
            <p className="text-gray-500 mb-6">
            Your email address has been verified successfully.
            Redirecting to login…
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </>
        )}

        {status === 'invalid' && (
          <>
            <span className="text-6xl block mb-4">❌</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid verification link</h2>
            <p className="text-gray-500 mb-6">
              This verification link is not valid. Request a new verification email below.
            </p>
          </>
        )}

        {status === 'expired' && (
          <>
            <span className="text-6xl block mb-4">⏰</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification link expired</h2>
            <p className="text-gray-500 mb-6">
              This link has expired. Request a new verification email below.
            </p>
          </>
        )}

        {showResendForm && (
          <>
            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" disabled={resending} className="btn-primary w-full">
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-primary-500 font-medium">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
