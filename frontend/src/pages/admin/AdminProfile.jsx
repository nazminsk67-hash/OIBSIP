import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { selectCurrentUser } from '../../redux/authSlice'
import { authApi } from '../../api/authApi'
import { formatDate } from '../../utils/helpers'
import Loader from '../../components/common/Loader'
import notify from '../../utils/notification'

export default function AdminProfile() {
  const user = useSelector(selectCurrentUser)
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const handleProfileSave = async () => {
    try {
      setSaving(true)
      const { data } = await authApi.updateProfile({ name })
      notify.success('Admin profile updated successfully')
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update profile'
      notify.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      notify.error('Please fill in both password fields')
      return
    }

    try {
      setPasswordSaving(true)
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      notify.success('Password changed successfully')
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update password'
      notify.error(msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!user) return <Loader fullScreen />

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Admin account</p>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Admin profile</h1>
        <p className="max-w-2xl" style={{ color: 'var(--text-tertiary)' }}>Manage your admin account details and security settings.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'security', label: 'Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-semibold border-b-2 transition"
            style={{
              borderColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <section className="space-y-6 rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Profile details</h2>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Your admin account information and settings.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-3xl border px-4 py-3 text-sm outline-none transition"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</span>
              <input
                value={user.email}
                readOnly
                className="w-full rounded-3xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-tertiary)',
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Role</p>
              <p className="mt-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{user.role || 'Admin'}</p>
            </div>
            <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Member since</p>
              <p className="mt-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProfileSave}
            disabled={saving}
            className="rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
            }}
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </section>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <section className="space-y-6 rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h2>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Update your password on a secure connection.</p>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-3xl border px-4 py-3 text-sm outline-none transition"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-3xl border px-4 py-3 text-sm outline-none transition"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={passwordSaving}
            className="rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
            }}
          >
            {passwordSaving ? 'Updating...' : 'Change password'}
          </button>
        </section>
      )}
    </div>
  )
}
