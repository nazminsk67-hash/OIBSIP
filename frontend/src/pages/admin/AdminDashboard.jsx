import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from '../../redux/orderSlice'
import { fetchAdminPizzas, selectPizzas } from '../../redux/pizzaSlice'
import { formatPrice } from '../../utils/helpers'
import React, { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
// We'll lazily load recharts at runtime to reduce initial bundle size on first load
// If recharts is already bundled by Vite-plugin, this falls back gracefully.
// For safety, we also support runtime import.
const useRecharts = () => {
  const [lib, setLib] = useState(null)
  useEffect(() => {
    let mounted = true
    import('recharts')
      .then((m) => { if (mounted) setLib(m) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])
  return lib
}
import Loader from '../../components/common/Loader'
import { SkeletonStats, SkeletonChartPlaceholder, SkeletonListItem } from '../../components/common/SkeletonLoaders'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const pizzas = useSelector(selectPizzas)
  const loading = useSelector(selectOrderLoading)
  const error = useSelector(selectOrderError)
  const recharts = useRecharts()

  useEffect(() => {
    dispatch(fetchAllOrders())
    dispatch(fetchAdminPizzas())
  }, [dispatch])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const revenue     = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const delivered   = orders.filter((order) => order.status === 'Delivered').length
    const pending     = totalOrders - delivered
    const deliveryRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0
    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0

    const pizzaCount = orders.reduce((count, order) => {
      if (order.pizzas?.length) {
        order.pizzas.forEach((item) => {
          const key = item.name || item.pizza || 'Custom'
          count[key] = (count[key] || 0) + (item.quantity || 1)
        })
      }
      return count
    }, {})

    const topPizzas = Object.entries(pizzaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const orderStatuses = orders.reduce((acc, order) => {
      const status = order.status || 'Processing'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const statusData = Object.entries(orderStatuses).map(([status, count]) => ({
      name: status,
      value: count,
    }))

    const days = [...Array(7)].map((_, idx) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - idx))
      return date.toISOString().slice(0, 10)
    })

    const daily = days.map((date) => {
      const dayOrders = orders.filter((order) => order.createdAt?.slice(0, 10) === date)
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      }
    })

    return {
      totalOrders,
      revenue,
      delivered,
      pending,
      deliveryRate,
      avgOrderValue,
      topPizzas,
      daily,
      statusData,
    }
  }, [orders])

  // Don't block the entire view while loading - show skeletons instead
  const isFirstLoad = loading && orders.length === 0

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--danger-color)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load dashboard</h2>
          <p style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Admin metrics</p>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Business insights</h1>
        <p className="max-w-2xl" style={{ color: 'var(--text-tertiary)' }}>A quick view of orders, revenue and menu performance.</p>
      </div>

      {isFirstLoad ? (
        <>
          <SkeletonStats />
          <div className="grid gap-6 xl:grid-cols-2">
            <SkeletonChartPlaceholder />
            <SkeletonChartPlaceholder />
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_0.9fr]">
            <SkeletonChartPlaceholder height="h-64" />
            <SkeletonListItem />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border p-6 shadow-sm" 
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total orders</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.totalOrders}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>All-time orders</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" 
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Revenue</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(stats.revenue)}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Total earned</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" 
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Delivered</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.delivered}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>{stats.deliveryRate}% completion</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" 
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Avg order</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(stats.avgOrderValue)}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Average value</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Order activity</p>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Orders per day</h2>
                </div>
              </div>
              <div className="h-72">
                {recharts ? (
                  <recharts.ResponsiveContainer width="100%" height="100%">
                    <recharts.AreaChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <recharts.XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                      <recharts.YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                      <recharts.Tooltip formatter={(value) => [value, 'Orders']} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                      <recharts.Area type="monotone" dataKey="orders" stroke="var(--accent-primary)" fill="var(--accent-light)" fillOpacity={0.65} />
                    </recharts.AreaChart>
                  </recharts.ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>Loading charts...</div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Order status</p>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Breakdown</h2>
                </div>
              </div>
              <div className="h-72">
                {recharts ? (
                  stats.statusData.length > 0 ? (
                    <recharts.ResponsiveContainer width="100%" height="100%">
                      <recharts.PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <recharts.Pie
                          data={stats.statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value})`}
                          outerRadius={80}
                          fill="var(--text-tertiary)"
                          dataKey="value"
                        >
                          <recharts.Cell fill="var(--success-color)" />
                          <recharts.Cell fill="var(--accent-primary)" />
                          <recharts.Cell fill="var(--info-color)" />
                          <recharts.Cell fill="var(--text-tertiary)" />
                        </recharts.Pie>
                        <recharts.Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                      </recharts.PieChart>
                    </recharts.ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>No order data yet</div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>Loading charts...</div>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Revenue</p>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly revenue</h2>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                    <Tooltip formatter={(value) => [formatPrice(value), 'Revenue']} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                    <Bar dataKey="revenue" fill="var(--info-color)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="space-y-2 mb-6">
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Menu</p>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Catalog size</h2>
              </div>
              <div className="space-y-4">
                  <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total pizzas</p>
                    <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{pizzas.length}</p>
                  </div>
                  <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Available</p>
                    <p className="mt-3 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{pizzas.filter((p) => p.isAvailable).length}</p>
                  </div>
                </div>
              </section>
            </div>
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Performance</p>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Top performing pizzas</h2>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="space-y-3">
                {stats.topPizzas.length ? (
                  stats.topPizzas.map((pizza, idx) => (
                    <div key={pizza.name} className="flex items-center justify-between rounded-3xl px-4 py-3" 
                       style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>#{idx + 1}</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{pizza.name}</span>
                      </div>
                      <span className="rounded-full px-3 py-1 text-sm font-semibold" 
                            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>{pizza.count} orders</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No order data yet to display top pizzas.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  )
}
