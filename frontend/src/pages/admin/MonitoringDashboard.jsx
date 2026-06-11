import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import api from '../../api/axiosConfig'

const REFRESH_MS = 30_000

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value ?? '—'}</p>
      {sub && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

export default function MonitoringDashboard() {
  const [business, setBusiness] = useState(null)
  const [system, setSystem] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        adminApi.getHealthMetrics(),
        api.get('/health/metrics'),
      ])
      setBusiness(healthRes.data)
      setSystem(metricsRes.data)
    } catch {
      toast.error('Unable to load monitoring metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  const uptimeHours = system?.uptimeSeconds
    ? (system.uptimeSeconds / 3600).toFixed(1)
    : null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Monitoring</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Production metrics
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Read-only server and platform metrics. Refreshes every 30 seconds.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">System</h2>
        <div className="stats-grid">
          <MetricCard label="Server uptime" value={uptimeHours ? `${uptimeHours}h` : '—'} sub={`${system?.uptimeSeconds ?? 0}s total`} />
          <MetricCard label="Heap used" value={system?.memory?.heapUsedMb != null ? `${system.memory.heapUsedMb} MB` : '—'} />
          <MetricCard label="RSS memory" value={system?.memory?.rssMb != null ? `${system.memory.rssMb} MB` : '—'} />
          <MetricCard label="CPU cores" value={system?.cpu?.cores} sub={system?.cpu?.loadAverage?.map((n) => n.toFixed(2)).join(' / ')} />
          <MetricCard label="Database" value={system?.database || business?.databaseStatus} />
          <MetricCard label="Active sessions" value={system?.activeSessions ?? business?.activeSessions} />
          <MetricCard label="Node version" value={system?.nodeVersion} sub={system?.environment} />
          <MetricCard label="API status" value={system?.status === 'ok' ? 'Healthy' : 'Unknown'} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Business (read-only)</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total users" value={business?.totalUsers} />
          <MetricCard label="Total orders" value={business?.totalOrders} />
          <MetricCard label="Total pizzas" value={business?.totalPizzas} />
          <MetricCard
            label="Revenue"
            value={business?.revenue != null ? `₹${Number(business.revenue).toFixed(2)}` : '—'}
          />
        </div>
      </section>
    </div>
  )
}
