import React, { useEffect, useState } from 'react'
import { orderApi } from '../../api/orderApi'
import { formatPrice } from '../../utils/helpers'

export default function OrderStatus() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    orderApi.getMyOrders().then(r => { if (mounted) setOrders(r.data) }).catch(()=>{}).finally(()=>{ if (mounted) setLoading(false) })
    return ()=>{ mounted = false }
  }, [])

  if (loading) return <div className="p-8">Loading orders…</div>

  if (!orders.length) return <div className="p-8">No orders yet</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Order #{o._id}</div>
                <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm">{o.status}</div>
            </div>

            <div className="mt-3">
              {(o.pizzas||[]).map(p => (
                <div key={p._id || p.name} className="flex justify-between py-1">
                  <div>{p.name} {p.size} x{p.quantity}</div>
                  <div>{formatPrice((p.sizePrice||0) * (p.quantity||1) + ((p.toppings||[]).reduce((s,t)=>s+(t.extraPrice||0),0) * (p.quantity||1)))}</div>
                </div>
              ))}
              {/* legacy builder display */}
              {o.base && (
                <div className="mt-2 text-sm text-gray-700">Custom pizza — total {formatPrice(o.totalPrice)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
