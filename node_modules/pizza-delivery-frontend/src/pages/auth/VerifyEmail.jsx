import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import Loader from '../../components/common/Loader'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.verifyEmail(token)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <div className="auth-wrapper">
      <div className="auth-card text-center">
        {status === 'loading' && (
          <>
            <Loader size="lg" />
            <p className="text-gray-500 mt-4">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="text-6xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-500 mb-6">
              Your account is now active. You can sign in.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Go to login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="text-6xl block mb-4">❌</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-500 mb-6">
              The link is invalid or has expired. Please register again.
            </p>
            <Link to="/register" className="btn-primary inline-block">
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
