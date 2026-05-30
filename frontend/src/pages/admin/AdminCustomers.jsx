import React, { useEffect, useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import ExportButtons from '../../components/admin/ExportButtons'
import { formatDateTime } from '../../utils/helpers'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getCustomers({ search, active: activeOnly })
      setCustomers(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [search, activeOnly])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const totalSpending = useMemo(() => customers.reduce((sum, user) => sum + (user.totalSpent || 0), 0), [customers])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="card" style={{ borderColor: 'var(--danger-color)', backgroundColor: 'var(--danger-light)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load customers</h2>
          <p className="mt-2" style={{ color: 'var(--danger-color)' }}>{error}</p>
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
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
                <label className="label">Search customers</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or email"
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveOnly((prev) => !prev)}
                className="btn-secondary"
                style={{
                  backgroundColor: activeOnly ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: activeOnly ? 'var(--text-inverse)' : 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {activeOnly ? 'Active only' : 'Show active only'}
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border" style={{ borderColor: 'var(--border-color)' }}>
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

      <td>{customer.totalOrders}</td>

      <td>
        ₹{customer.totalSpent?.toFixed(2)}
      </td>

      <td>
        {formatDateTime(customer.createdAt)}
      </td>

      <td>
        {customer.isEmailVerified ? 'Active' : 'Inactive'}
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card">
            <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Customer insights</p>
            <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Total customers</span>
                <strong style={{ color: 'var(--text-primary)' }}>{customers.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Total spending</span>
                <strong style={{ color: 'var(--text-primary)' }}>₹{totalSpending.toFixed(2)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-primary)' }}>Verified accounts</span>
                <strong style={{ color: 'var(--text-primary)' }}>{customers.filter((user) => user.isEmailVerified).length}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
