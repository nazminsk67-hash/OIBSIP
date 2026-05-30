import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
import ExportButtons from '../../components/admin/ExportButtons'

const statusOptions = ['all', ...Object.values(ORDER_STATUS), 'Cancelled']

export default function AdminOrderCenter() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const loading = useSelector(selectOrderLoading)
  const error = useSelector(selectOrderError)

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    dispatch(fetchAllOrders())
  }, [dispatch])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === 'all' || order.status === selectedStatus
      const query = search.trim().toLowerCase()
      const matchesSearch =
        !query ||
        order._id.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.address?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [orders, selectedStatus, search])

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
  }, [orders])

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    if (!newStatus) return
    setUpdatingOrderId(orderId)
    try {
      await dispatch(updateOrderStatusAsync({ id: orderId, status: newStatus })).unwrap()
      toast.success(`Order status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err || 'Failed to update status')
    } finally {
      setUpdatingOrderId(null)
    }
  }, [dispatch])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--danger-color)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load order center</h2>
          <p className="mt-2" style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      </div>
    )
  }

  const exportRows = filteredOrders.map((order) => ({
    id: order._id,
    customer: order.user?.name,
    email: order.user?.email,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalPrice: order.totalPrice,
    createdAt: formatDateTime(order.createdAt),
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Admin Order Center</p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Order operations</h1>
          <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>Search, review order details, and update fulfillment status quickly.</p>
        </div>
        <ExportButtons rows={exportRows} filename="order_center_report" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.4fr]">
        <section className="space-y-4 rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Search orders</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order ID, customer, address or phone"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const selected = selectedStatus === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition"
                    style={{
                      backgroundColor: selected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: selected ? 'var(--text-inverse)' : 'var(--text-primary)',
                      border: selected ? '1px solid transparent' : `1px solid var(--border-color)`,
                    }}
                  >
                    {status === 'all' ? 'All' : status}
                    {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-10 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>No matching orders</p>
                <h2 className="mt-4 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Try a different filter</h2>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="rounded-3xl border p-5 shadow-sm transition hover:shadow-md" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <button
                        type="button"
                        className="text-left text-xs uppercase tracking-[0.22em]"
                        style={{ color: 'var(--accent-primary)' }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        VIEW DETAILS
                      </button>
                      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{order.user?.name || 'Guest'} · {order.user?.email || 'Unknown email'}</p>
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{order.address}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(order.createdAt)}</span>
                      <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(order.totalPrice)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Payment</p>
                      <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.paymentMethod || 'Cash on Delivery'}</p>
                      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{order.payment.status || 'pending'}</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Delivery</p>
                      <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.phone}</p>
                      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{order.address}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.values(ORDER_STATUS).map((status) => {
                      const disabled = updatingOrderId === order._id || order.status === status
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(order._id, status)}
                          disabled={disabled}
                          className="rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            backgroundColor: disabled ? 'var(--bg-secondary)' : 'var(--bg-card)',
                            border: `1px solid var(--border-color)`,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {status}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Summary</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total orders</span>
                <strong style={{ color: 'var(--text-primary)' }}>{orders.length}</strong>
              </div>
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Details</p>
            {selectedOrder ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{selectedOrder.user?.name} · {selectedOrder.user?.email}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{selectedOrder.address}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{selectedOrder.phone}</p>
                <div className="space-y-2 rounded-2xl p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Timeline</p>
                  <ol className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <li>{selectedOrder.status}</li>
                    <li>{selectedOrder.payment.status || 'pending'}</li>
                    <li>{formatDateTime(selectedOrder.createdAt)}</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>Select an order to review customer details, payment info, and status timeline.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
