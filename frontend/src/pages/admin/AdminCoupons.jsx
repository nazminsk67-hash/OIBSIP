import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { couponApi } from '../../api/couponApi'
import {
  notifyNewCoupon,
  notifyCouponActivated,
} from '../../utils/marketingNotifications'
import { formatPrice } from '../../utils/helpers'

const initialForm = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrderAmount: 0,
  maxDiscount: 0,
  expiryDate: '',
  usageLimit: 0,
  perUserLimit: 1,
  active: true,
}

export default function AdminCoupons() {
  const dispatch = useDispatch()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await couponApi.getCoupons()
      setCoupons(response.data)
    } catch (err) {
      toast.error('Unable to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (cancelled) return
      await fetchCoupons()
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase()
    return coupons.filter((coupon) => coupon.code.toLowerCase().includes(query) || coupon.type.toLowerCase().includes(query))
  }, [coupons, search])

  const openForm = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setForm({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        value: coupon.value || 0,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscount: coupon.maxDiscount || 0,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
        usageLimit: coupon.usageLimit || 0,
        perUserLimit: coupon.perUserLimit || 1,
        active: coupon.active,
      })
    } else {
      setEditingCoupon(null)
      setForm(initialForm)
    }
    setShowForm(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!form.code.trim()) {
      toast.error('Coupon code is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: Number(form.maxDiscount),
        expiryDate: form.expiryDate || undefined,
        usageLimit: Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit),
        active: Boolean(form.active),
      }

      if (editingCoupon) {
        const response = await couponApi.updateCoupon(editingCoupon._id, payload)
        setCoupons((prev) => prev.map((coupon) => (coupon._id === response.data._id ? response.data : coupon)))
        toast.success('Coupon updated successfully')
      } else {
        const response = await couponApi.createCoupon(payload)
        setCoupons((prev) => [response.data, ...prev])
        const discountText =
          payload.type === 'percentage'
            ? `get ${payload.value}% off`
            : `save ${formatPrice(payload.value)}`
        notifyNewCoupon(dispatch, response.data.code || payload.code, discountText)
        toast.success('Coupon created successfully')
      }

      setShowForm(false)
      setEditingCoupon(null)
      setForm(initialForm)
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to save coupon'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return
    try {
      await couponApi.deleteCoupon(coupon._id)
      setCoupons((prev) => prev.filter((item) => item._id !== coupon._id))
      toast.success('Coupon deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete coupon')
    }
  }

  const toggleActive = async (coupon) => {
    try {
      const response = await couponApi.activateCoupon(coupon._id, !coupon.active)
      setCoupons((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
      if (response.data.active) {
        notifyCouponActivated(dispatch, response.data.code || coupon.code)
      }
      toast.success(`Coupon ${response.data.active ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update coupon status')
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Promotions</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Coupon manager</h1>
          <p className="mt-2 text-slate-600">Create, update, and track coupon campaigns for customers.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          New coupon
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Manage active coupon codes and usage rules.</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons"
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
          />
        </div>

        <div className="space-y-4">
          {filteredCoupons.length === 0 ? (
            <p className="text-sm text-slate-500">No coupons found.</p>
          ) : (
            filteredCoupons.map((coupon) => (
              <div key={coupon._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{coupon.code}</p>
                    <p className="text-sm text-slate-500">{coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">Min {formatPrice(coupon.minOrderAmount)}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">Max {formatPrice(coupon.maxDiscount)}</span>
                    <span className={`rounded-full px-3 py-1 ${coupon.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="text-sm text-slate-600">Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</div>
                  <div className="text-sm text-slate-600">Usage: {coupon.usageCount || 0}/{coupon.usageLimit || '∞'}</div>
                  <div className="text-sm text-slate-600">Per-user: {coupon.perUserLimit || '∞'}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary" onClick={() => openForm(coupon)}>
                    Edit
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => toggleActive(coupon)}>
                    {coupon.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(coupon)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingCoupon ? 'Edit coupon' : 'Create new coupon'}
              </h2>
              <p className="text-sm text-slate-500">Define the reward rules for this coupon code.</p>
            </div>
            <button type="button" className="text-sm font-semibold text-slate-600" onClick={() => { setShowForm(false); setEditingCoupon(null) }}>
              Close
            </button>
          </div>

          <form onSubmit={handleSave} className="form-stack-2">
            <label className="space-y-2 text-sm">
              <span>Coupon code</span>
              <input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="input-field"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span>Value</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Minimum order amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Maximum discount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.maxDiscount}
                onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Expiry date</span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Usage limit</span>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Per-user limit</span>
              <input
                type="number"
                min="0"
                value={form.perUserLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, perUserLimit: e.target.value }))}
                className="input-field"
              />
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              <span>Active</span>
            </label>
            <div className="lg:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold">
                {saving ? 'Saving…' : editingCoupon ? 'Update coupon' : 'Create coupon'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
