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
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Admin metrics</p>
        <h1 className="text-3xl font-semibold text-slate-900">Business insights</h1>
        <p className="max-w-2xl text-slate-600">A quick view of orders, revenue and menu performance.</p>
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
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total orders</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.totalOrders}</p>
              <p className="mt-2 text-xs text-slate-500">All-time orders</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Revenue</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{formatPrice(stats.revenue)}</p>
              <p className="mt-2 text-xs text-slate-500">Total earned</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Delivered</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.delivered}</p>
              <p className="mt-2 text-xs text-slate-500">{stats.deliveryRate}% completion</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Avg order</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{formatPrice(stats.avgOrderValue)}</p>
              <p className="mt-2 text-xs text-slate-500">Average value</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Order activity</p>
                  <h2 className="text-xl font-semibold text-slate-900">Orders per day</h2>
                </div>
              </div>
              <div className="h-72">
                {recharts ? (
                  <recharts.ResponsiveContainer width="100%" height="100%">
                    <recharts.AreaChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <recharts.CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <recharts.XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <recharts.YAxis tickLine={false} axisLine={false} />
                      <recharts.Tooltip formatter={(value) => [value, 'Orders']} />
                      <recharts.Area type="monotone" dataKey="orders" stroke="#f97316" fill="#fed7aa" fillOpacity={0.45} />
                    </recharts.AreaChart>
                  </recharts.ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">Loading charts...</div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Order status</p>
                  <h2 className="text-xl font-semibold text-slate-900">Breakdown</h2>
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
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <recharts.Cell fill="#10b981" />
                          <recharts.Cell fill="#f97316" />
                          <recharts.Cell fill="#6366f1" />
                          <recharts.Cell fill="#64748b" />
                        </recharts.Pie>
                        <recharts.Tooltip />
                      </recharts.PieChart>
                    </recharts.ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">No order data yet</div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">Loading charts...</div>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Revenue</p>
                  <h2 className="text-xl font-semibold text-slate-900">Weekly revenue</h2>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [formatPrice(value), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2 mb-6">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Menu</p>
                <h2 className="text-xl font-semibold text-slate-900">Catalog size</h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total pizzas</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{pizzas.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Available</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{pizzas.filter((p) => p.isAvailable).length}</p>
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Performance</p>
              <h2 className="text-2xl font-semibold text-slate-900">Top performing pizzas</h2>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                {stats.topPizzas.length ? (
                  stats.topPizzas.map((pizza, idx) => (
                    <div key={pizza.name} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary-600">#{idx + 1}</span>
                        <span className="font-medium text-slate-900">{pizza.name}</span>
                      </div>
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">{pizza.count} orders</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-8">No order data yet to display top pizzas.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
          <p className="mt-2">{error}</p>
        </div>
      )}
    </div>
  )
}
