import React, { useEffect, useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import ExportButtons from '../../components/admin/ExportButtons'
import { formatDateTime } from '../../utils/helpers'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getCustomers({ search: debouncedSearch, active: activeOnly })
      setCustomers(response.data)
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      if (err.response?.status === 429) {
        toast.error('Too many requests — wait a few seconds and retry.')
      }
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, activeOnly])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const totalSpending = useMemo(() => customers.reduce((sum, user) => sum + (user.totalSpent || 0), 0), [customers])

  if (loading && customers.length === 0 && !error) {
    return (
      <div className="page-shell">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error && customers.length === 0) {
    return (
      <div className="page-shell">
        <div className="card" style={{ borderColor: 'var(--danger-color)', backgroundColor: 'var(--danger-light)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load customers</h2>
          <p className="mt-2" style={{ color: 'var(--danger-color)' }}>{error}</p>
          <button type="button" onClick={fetchCustomers} className="btn-primary mt-4">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const exportRows = customers.map((user) => ({
    name: user.name,
    email: user.email,
    active: user.isEmailVerified,
    totalOrders: user.totalOrders,
    totalSpent: user.totalSpent,
    joinedAt: formatDateTime(user.createdAt),
  }))

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Admin Customers</p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Customer management</h1>
          <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>Browse customer profiles, resolution history, and spending trends.</p>
        </div>
        <ExportButtons rows={exportRows} filename="customer_report" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.4fr]">
          <section className="card space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label className="label" htmlFor="customer-search">Search customers</label>
                <input
                  id="customer-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or email"
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveOnly((prev) => !prev)}
                className="btn-secondary self-end"
                style={{
                  backgroundColor: activeOnly ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: activeOnly ? 'var(--text-inverse)' : 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {activeOnly ? 'Active only' : 'Show active only'}
              </button>
            </div>

            <div className="table-responsive rounded-3xl border" style={{ borderColor: 'var(--border-color)' }}>
              <table className="table-smooth">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Spent</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
  {customers.map((customer) => (
    <tr key={customer._id}>
      <td className="font-medium">
        {customer.name}
        <div
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {customer.email}
        </div>
      </td>
      <td>{customer.totalOrders ?? 0}</td>
      <td>₹{Number(customer.totalSpent || 0).toFixed(2)}</td>
      <td>{formatDateTime(customer.createdAt)}</td>
      <td>
        <span
          className="badge"
          style={{
            backgroundColor: customer.isEmailVerified ? 'var(--success-light)' : 'var(--warning-light)',
            color: customer.isEmailVerified ? 'var(--success-dark)' : 'var(--warning-dark)',
          }}
        >
          {customer.isEmailVerified ? 'Verified' : 'Pending'}
        </span>
      </td>
    </tr>
  ))}
                </tbody>
              </table>
              {customers.length === 0 && !loading && (
                <p className="p-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  No customers match your filters.
                </p>
              )}
            </div>
          </section>

          <aside className="card space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Summary</h2>
            <div className="theme-panel-muted rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] theme-text-muted">Total customers</p>
              <p className="mt-2 text-3xl font-semibold theme-text-primary">{customers.length}</p>
            </div>
            <div className="theme-panel-muted rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] theme-text-muted">Total spending</p>
              <p className="mt-2 text-3xl font-semibold theme-text-primary">₹{totalSpending.toFixed(2)}</p>
            </div>
          </aside>
      </div>
    </div>
  )
}
