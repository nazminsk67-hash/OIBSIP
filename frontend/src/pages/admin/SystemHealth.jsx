import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'

const metricCards = [
  { key: 'totalUsers', label: 'Total users' },
  { key: 'totalPizzas', label: 'Total pizzas' },
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'activeSessions', label: 'Active sessions' },
]

export default function SystemHealth() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await adminApi.getHealthMetrics()
        setMetrics(response.data)
      } catch (err) {
        toast.error('Unable to load health metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">System health</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operational dashboard</h1>
        <p className="mt-2 text-slate-600">Monitor active connections, database health, and the state of your platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <div key={card.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">{card.key === 'revenue' ? `₹${metrics?.[card.key]?.toFixed(2)}` : metrics?.[card.key] ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Database status</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{metrics?.databaseStatus}</p>
      </div>
    </div>
  )
}
