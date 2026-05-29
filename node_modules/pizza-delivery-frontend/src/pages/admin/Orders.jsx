import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  fetchAllOrders,
  updateOrderStatusAsync,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  ORDER_STATUS,
} from '../../redux/orderSlice'
import { formatPrice, formatDateTime } from '../../utils/helpers'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'

const statusColors = {
  'Order Received': 'bg-amber-50 text-amber-900 border-amber-200',
  'In the Kitchen': 'bg-blue-50 text-blue-900 border-blue-200',
  'Sent to Delivery': 'bg-purple-50 text-purple-900 border-purple-200',
  'Delivered': 'bg-emerald-50 text-emerald-900 border-emerald-200',
}

const statusOptions = Object.values(ORDER_STATUS)

export default function Orders() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const loading = useSelector(selectOrderLoading)
  const error = useSelector(selectOrderError)
  
  const [filteredOrders, setFilteredOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    dispatch(fetchAllOrders())
  }, [dispatch])

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((o) => o.status === selectedStatus))
    }
  }, [orders, selectedStatus])

  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus) return
    
    setUpdatingOrderId(orderId)
    try {
      await dispatch(updateOrderStatusAsync({ id: orderId, status: newStatus })).unwrap()
      toast.success(`Order status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-semibold">Unable to load orders</h2>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">No orders</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-3 text-slate-600">Orders will appear here once customers start placing them.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Orders management</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selectedStatus === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Orders
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedStatus === status
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className={`rounded-2xl border-2 p-6 transition ${statusColors[order.status] || statusColors['Order Received']}`}
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <p className="text-xs font-semibold opacity-75">Order ID</p>
                    <p className="font-mono text-sm font-bold">#{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-75">Customer</p>
                    <p className="font-semibold">{order.user?.name || 'Unknown'}</p>
                    <p className="text-sm opacity-75">{order.user?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-75">Date</p>
                    <p className="font-semibold">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Total & Status */}
              <div className="flex flex-col items-end gap-2">
                <p className="text-2xl font-bold">{formatPrice(order.totalPrice)}</p>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-75">Payment</p>
                  <p className="text-sm font-semibold capitalize">{order.paymentMethod || 'cash'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="mb-4 rounded-xl bg-black bg-opacity-5 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold opacity-75">Delivery Address</p>
                  <p className="text-sm font-medium">{order.address}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold opacity-75">Phone</p>
                  <p className="text-sm font-medium">{order.phone}</p>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold opacity-75">Ordered Items</p>
              <div className="space-y-1">
                {order.pizzas?.length ? (
                  order.pizzas.map((item, idx) => (
                    <p key={idx} className="text-sm font-medium">
                      {item.quantity}x {item.name} ({item.size})
                      {item.toppings?.length ? ` + ${item.toppings.map((t) => t.name).join(', ')}` : ''}
                    </p>
                  ))
                ) : order.base ? (
                  <p className="text-sm font-medium">
                    {order.quantity}x Pizza • {order.base?.name} • {order.sauce?.name} • {order.cheese?.name}
                    {order.veggies?.length ? ` • ${order.veggies.map((v) => v.name).join(', ')}` : ''}
                  </p>
                ) : (
                  <p className="text-sm opacity-75">No items</p>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold opacity-75">Current Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updatingOrderId === order._id}
                  className="rounded-lg border border-current border-opacity-20 bg-white bg-opacity-50 px-3 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  <option disabled>Update status...</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {updatingOrderId === order._id && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-opacity-30 border-t-current" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
