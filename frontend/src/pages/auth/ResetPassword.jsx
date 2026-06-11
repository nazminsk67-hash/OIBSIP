import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../../api/authApi'

export default function ResetPassword() {
  const { token }   = useParams()
  const navigate    = useNavigate()

  const [form, setForm]     = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.password)                        errs.password        = 'Password is required'
    if (form.password.length < 6)             errs.password        = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await authApi.resetPassword(token, form.password)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link expired or invalid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🔐</span>
          <h1 className="text-2xl font-bold text-gray-900">New password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }}
              placeholder="Min. 6 characters"
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })) }}
              placeholder="••••••••"
              className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
