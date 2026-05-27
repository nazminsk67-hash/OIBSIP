import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from '../../redux/orderSlice'
import { fetchAdminPizzas, selectPizzas } from '../../redux/pizzaSlice'
import { formatPrice } from '../../utils/helpers'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Loader from '../../components/common/Loader'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const pizzas = useSelector(selectPizzas)
  const loading = useSelector(selectOrderLoading)
  const error = useSelector(selectOrderError)

  useEffect(() => {
    dispatch(fetchAllOrders())
    dispatch(fetchAdminPizzas())
  }, [dispatch])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const revenue     = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const delivered   = orders.filter((order) => order.status === 'Delivered').length
    const pending     = totalOrders - delivered
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

    return { totalOrders, revenue, delivered, pending, topPizzas, daily }
  }, [orders])

  if (loading) return <Loader fullScreen />

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total orders</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.totalOrders}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Revenue</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatPrice(stats.revenue)}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Delivered</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.delivered}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.pending}</p>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Area type="monotone" dataKey="orders" stroke="#f97316" fill="#fed7aa" fillOpacity={0.45} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

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
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Top pizzas</h2>
          <div className="mt-5 space-y-3">
            {stats.topPizzas.length ? (
              stats.topPizzas.map((pizza) => (
                <div key={pizza.name} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{pizza.name}</span>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{pizza.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">There is not enough order data yet to display top pizzas.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Menu size</h2>
          <p className="mt-2 text-sm text-slate-500">Pizzas available in the catalog.</p>
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total pizzas</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{pizzas.length}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
