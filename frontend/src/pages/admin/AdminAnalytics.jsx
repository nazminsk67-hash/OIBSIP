import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, selectOrders, selectOrderLoading, selectOrderError } from '../../redux/orderSlice'
import { fetchAdminPizzas, selectPizzas } from '../../redux/pizzaSlice'
import { formatPrice } from '../../utils/helpers'
import Loader from '../../components/common/Loader'
import { SkeletonStats, SkeletonChartPlaceholder, SkeletonListItem } from '../../components/common/SkeletonLoaders'

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

export default function AdminAnalytics() {
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
    const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const totalUsers = new Set(orders.map((order) => {
      if (!order) return 'Guest'
      if (typeof order.user === 'string') return order.user
      if (order.user?.email) return order.user.email
      if (order.user?.name) return order.user.name
      if (order.customer?.email) return order.customer.email
      if (order.customer?.name) return order.customer.name
      return String(order.user || order.customer || 'Guest')
    })).size
    const totalPizzas = pizzas.length

    const orderStatuses = orders.reduce((acc, order) => {
      const status = order.status || 'Processing'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const statusData = Object.entries(orderStatuses).map(([status, count]) => ({ name: status, value: count }))

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

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    return {
      totalOrders,
      revenue,
      totalUsers,
      totalPizzas,
      statusData,
      daily,
      topPizzas,
      recentOrders,
    }
  }, [orders, pizzas])

  const isFirstLoad = loading && orders.length === 0

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load analytics</h2>
          <p style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Admin analytics</p>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics overview</h1>
        <p className="max-w-2xl" style={{ color: 'var(--text-tertiary)' }}>A dedicated analytics dashboard for revenue, orders, users and pizza performance.</p>
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
            <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total revenue</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(stats.revenue)}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>All-time revenue</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total orders</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.totalOrders}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Orders processed</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total users</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.totalUsers}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Unique customers</p>
            </div>
            <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>Total pizzas</p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.totalPizzas}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Menu items available</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Revenue trends</p>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly revenue</h2>
                </div>
              </div>
              <div className="h-72">
                {recharts ? (
                  <recharts.ResponsiveContainer width="100%" height="100%">
                    <recharts.BarChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <recharts.XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                      <recharts.YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                      <recharts.Tooltip formatter={(value) => [formatPrice(value), 'Revenue']} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                      <recharts.Bar dataKey="revenue" fill="var(--info-color)" radius={[10, 10, 0, 0]} />
                    </recharts.BarChart>
                  </recharts.ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>Loading charts...</div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Order status</p>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Distribution</h2>
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
                          fill="var(--text-secondary)"
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
              <div className="space-y-2 mb-6">
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Popular pizzas</p>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Top menu items</h2>
              </div>
              <div className="space-y-3">
                {stats.topPizzas.length ? (
                  stats.topPizzas.map((pizza, idx) => (
                    <div key={pizza.name} className="flex items-center justify-between rounded-3xl px-4 py-3" 
                         style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>#{idx + 1}</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{pizza.name}</span>
                      </div>
                      <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>{pizza.count} orders</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No pizza orders yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="space-y-2 mb-6">
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Recent orders</p>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Latest activity</h2>
              </div>
              <div className="space-y-3">
                {stats.recentOrders.length ? (
                  stats.recentOrders.map((order) => {
                    const customer = order.user?.name || order.user?.email || order.customer?.name || order.customer?.email || 'Guest'
                    return (
                      <div key={order._id} className="rounded-3xl px-4 py-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{customer}</p>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(order.totalPrice)}</p>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{order.status || 'Processing'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No orders found yet.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
