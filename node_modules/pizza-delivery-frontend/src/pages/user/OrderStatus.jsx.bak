import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders, selectOrders, selectOrderLoading, selectOrderError } from '../../redux/orderSlice'
import { formatDateTime, formatPrice } from '../../utils/helpers'

const statusClasses = {
  'Order Received': 'bg-amber-100 text-amber-800',
  'In the Kitchen': 'bg-sky-100 text-sky-800',
  'Sent to Delivery': 'bg-violet-100 text-violet-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
}

export default function OrderStatus() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const loading = useSelector(selectOrderLoading)
  const error = useSelector(selectOrderError)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  if (loading) return <div className="p-8">Loading orders…</div>
  if (error) return (
    <div className="p-8 max-w-4xl mx-auto rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
      <h2 className="text-xl font-semibold">Unable to load your orders</h2>
      <p className="mt-2">{error}</p>
    </div>
  )
  if (!orders.length) return (
    <div className="p-8 min-h-[60vh]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">No order history</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">You haven’t placed any orders yet</h2>
        <p className="mt-3 text-slate-600">Once you order, your recent pizzas will show up here.</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Order history</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">My orders</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const totalAmount = order.totalPrice || (order.pizzas || []).reduce((sum, p) => {
            const pizzaPrice = (p.sizePrice || 0) + (p.toppings || []).reduce((acc, t) => acc + (t.extraPrice || 0), 0)
            return sum + pizzaPrice * (p.quantity || 1)
          }, 0)

          return (
            <div key={order._id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">#{order._id}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[order.status] || 'bg-slate-100 text-slate-800'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-slate-500">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {(order.pizzas || []).map((item, index) => (
                  <div key={`${item._id || item.name}-${index}`} className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.size} · Qty {item.quantity}
                        {item.toppings?.length ? ` · ${item.toppings.map((t) => t.name).join(', ')}` : ''}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">{formatPrice(((item.sizePrice || 0) + (item.toppings || []).reduce((acc, t) => acc + (t.extraPrice || 0), 0)) * (item.quantity || 1))}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
