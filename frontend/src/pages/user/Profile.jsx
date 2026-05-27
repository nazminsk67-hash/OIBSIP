import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { fetchMyOrders, selectOrders } from '../../redux/orderSlice'
import { selectCurrentUser, setUser } from '../../redux/authSlice'
import { authApi } from '../../api/authApi'
import { formatDate, formatDateTime, formatPrice } from '../../utils/helpers'
import Loader from '../../components/common/Loader'

export default function Profile() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const orders = useSelector(selectOrders)
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    totalSpent: orders.reduce((total, order) => total + (order.totalPrice || 0), 0),
    lastOrder: orders[0],
  }), [orders])

  const handleProfileSave = async () => {
    try {
      setSaving(true)
      const { data } = await authApi.updateProfile({ name })
      dispatch(setUser(data.user))
      toast.success('Profile updated successfully')
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields')
      return
    }

    try {
      setPasswordSaving(true)
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password changed successfully')
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update password'
      toast.error(msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!user) return <Loader fullScreen />

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Account</p>
        <h1 className="text-3xl font-semibold text-slate-900">Your profile</h1>
        <p className="max-w-2xl text-slate-600">Update your display name, secure your account, and review recent activity.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_0.75fr]">
        <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Profile details</h2>
            <p className="text-sm text-slate-500">Your main account settings are stored securely.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                value={user.email}
                readOnly
                className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joined</p>
              <p className="mt-2 font-semibold text-slate-900">{formatDate(user.createdAt)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recent order</p>
              <p className="mt-2 font-semibold text-slate-900">{stats.lastOrder ? formatDateTime(stats.lastOrder.createdAt) : 'No orders yet'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProfileSave}
            disabled={saving}
            className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save profile
          </button>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
            <p className="text-sm text-slate-500">Update your password on a secure connection.</p>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
          </label>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={passwordSaving}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Change password
          </button>
        </section>
      </div>

      <section className="mt-8 space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Activity</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Order summary</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Orders</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Spend</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatPrice(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {orders.length ? (
            orders.slice(0, 3).map((order) => (
              <div key={order._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-900">#{order._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-600">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                  <span>{order.pizzas?.length ? `${order.pizzas.length} item(s)` : 'Custom pizza'}</span>
                  <span className="font-semibold">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No recent orders yet. Start browsing the menu to place your first order.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
