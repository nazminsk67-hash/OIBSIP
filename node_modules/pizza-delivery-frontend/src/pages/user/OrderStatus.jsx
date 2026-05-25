import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders, selectOrders, selectOrderLoading } from '../../redux/orderSlice'
import { formatPrice } from '../../utils/helpers'

export default function OrderStatus() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const loading = useSelector(selectOrderLoading)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  if (loading) return <div className="p-8">Loading orders…</div>
  if (!orders.length) return <div className="p-8">No orders yet</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="p-4 border rounded">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">Order #{o._id}</div>
                <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm font-medium">{o.status}</div>
            </div>

            <div className="mt-3 space-y-2">
              {(o.pizzas || []).map((p, idx) => (
                <div key={`${p._id || p.name}-${idx}`} className="flex justify-between text-sm">
                  <div>{p.name} {p.size} x{p.quantity}</div>
                  <div>{formatPrice(((p.sizePrice || 0) + (p.toppings || []).reduce((s, t) => s + (t.extraPrice || 0), 0)) * (p.quantity || 1))}</div>
                </div>
              ))}
              {o.base && (
                <div className="text-sm text-gray-700">Custom pizza — total {formatPrice(o.totalPrice)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
