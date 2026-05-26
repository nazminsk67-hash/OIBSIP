import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../../hooks/useSocket'
import { fetchMyOrders, selectOrders, ORDER_STATUS } from '../../redux/orderSlice'
import { formatDateTime, formatPrice } from '../../utils/helpers'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'

const progressSteps = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered']

const getProgressPercentage = (status) => {
  const index = progressSteps.indexOf(status)
  return index === -1 ? 0 : ((index + 1) / progressSteps.length) * 100
}

const getStepStatus = (targetStep, currentStep) => {
  const targetIndex = progressSteps.indexOf(targetStep)
  const currentIndex = progressSteps.indexOf(currentStep)
  if (currentIndex > targetIndex) return 'completed'
  if (currentIndex === targetIndex) return 'current'
  return 'pending'
}

export default function OrderStatus() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const socket = useSocket()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError(null)
        await dispatch(fetchMyOrders()).unwrap()
      } catch (err) {
        setError(err || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [dispatch])

  useEffect(() => {
    if (!socket) return
    
    const handleOrderUpdate = () => {
      dispatch(fetchMyOrders()).catch(err => console.error('Failed to refresh orders:', err))
    }

    socket.on('orderStatusUpdated', handleOrderUpdate)
    
    return () => {
      socket.off('orderStatusUpdated', handleOrderUpdate)
    }
  }, [socket, dispatch])

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-200 h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 max-w-md">
          <h2 className="text-xl font-semibold">Unable to load orders</h2>
          <p className="mt-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm max-w-md">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">No order history</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">You haven't placed any orders yet</h2>
          <p className="mt-3 text-slate-600">Once you order, your recent pizzas will show up here with live tracking.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-8 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse pizzas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Track your orders</p>
        <h2 className="text-3xl font-semibold text-slate-900">Order history</h2>
        <p className="text-slate-600">
          {socket ? '🟢 Live updates active' : '⚪ Connecting for live updates...'}
        </p>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const totalAmount =
            order.totalPrice ||
            (order.pizzas || []).reduce((sum, p) => {
              const pizzaPrice =
                (p.sizePrice || 0) +
                (p.toppings || []).reduce((acc, t) => acc + (t.extraPrice || 0), 0)
              return sum + pizzaPrice * (p.quantity || 1)
            }, 0)

          const progress = getProgressPercentage(order.status)

          return (
            <div key={order._id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">#{order._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500 mt-1">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <OrderStatusBadge status={order.status} large />
                  <p className="text-lg font-bold text-slate-900">{formatPrice(totalAmount)}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Delivery Progress</h3>
                  <span className="text-xs text-slate-500">({order.status})</span>
                </div>

                <div className="mb-6 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {progressSteps.map((step, idx) => {
                    const status = getStepStatus(step, order.status)
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${
                            status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'current'
                                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                                : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {status === 'completed' ? '✓' : idx + 1}
                        </div>
                        <p className="text-center text-xs font-medium text-slate-700">{step}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.05em]">
                      Delivery Address
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.05em]">
                      Phone Number
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{order.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Order Items</h3>
                <div className="space-y-2">
                  {order.pizzas?.length ? (
                    order.pizzas.map((item, index) => (
                      <div
                        key={`${item._id || item.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">
                            {item.size} · Qty {item.quantity}
                            {item.toppings?.length ? ` · ${item.toppings.map((t) => t.name).join(', ')}` : ''}
                          </p>
                        </div>
                        <p className="ml-4 font-semibold text-slate-900">
                          {formatPrice(
                            ((item.sizePrice || 0) +
                              (item.toppings || []).reduce((acc, t) => acc + (t.extraPrice || 0), 0)) *
                              (item.quantity || 1)
                          )}
                        </p>
                      </div>
                    ))
                  ) : order.base ? (
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">Custom Pizza</p>
                        <p className="text-sm text-slate-600">
                          {order.base?.name} · {order.sauce?.name} · {order.cheese?.name}
                          {order.veggies?.length ? ` · ${order.veggies.map((v) => v.name).join(', ')}` : ''}
                        </p>
                      </div>
                      <p className="ml-4 font-semibold text-slate-900">
                        {formatPrice(
                          (order.base?.price || 0) +
                            (order.sauce?.price || 0) +
                            (order.cheese?.price || 0) +
                            (order.veggies || []).reduce((sum, v) => sum + (v.price || 0), 0) *
                              order.quantity
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-600">Payment Method:</p>
                  <p className="font-semibold text-slate-900 capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <p className="font-semibold text-slate-900">Total Amount</p>
                  <p className="font-bold text-primary-600">{formatPrice(totalAmount)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
