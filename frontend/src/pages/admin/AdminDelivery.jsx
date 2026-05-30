import React, { useEffect, useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import ExportButtons from '../../components/admin/ExportButtons'

const statusOptions = ['assigned', 'pickup', 'enroute', 'delivered', 'cancelled']

export default function AdminDelivery() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deliveryPerson, setDeliveryPerson] = useState('')
  const [selectedOrder, setSelectedOrder] = useState('')
  const [error, setError] = useState(null)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getDeliveryAssignments()
      setAssignments(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const handleAssign = async () => {
    if (!selectedOrder || !deliveryPerson) {
      toast.error('Order and delivery person are required')
      return
    }
    try {
      await adminApi.createDeliveryAssignment({ orderId: selectedOrder, deliveryPerson })
      toast.success('Delivery assignment created')
      setDeliveryPerson('')
      setSelectedOrder('')
      fetchAssignments()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminApi.updateDeliveryAssignmentStatus(id, status)
      toast.success('Assignment status updated')
      fetchAssignments()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  const activeCount = useMemo(() => assignments.filter((item) => item.status !== 'delivered' && item.status !== 'cancelled').length, [assignments])

  const exportRows = assignments.map((assignment) => ({
    orderId: assignment.order?._id,
    deliveryPerson: assignment.deliveryPerson,
    status: assignment.status,
    assignedAt: assignment.createdAt,
    assignedBy: assignment.assignedBy?.name,
  }))

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Delivery Management</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Active delivery assignments</h1>
          <p className="mt-2 text-slate-600">Assign delivery personnel, track progress, and review completed drops.</p>
        </div>
        <ExportButtons rows={exportRows} filename="delivery_assignments" />
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Order ID</span>
              <input
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                placeholder="Order ID"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 dark:bg-slate-950 dark:border-slate-700"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Delivery personnel</span>
              <input
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                placeholder="Name of delivery person"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 dark:bg-slate-950 dark:border-slate-700"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleAssign}
            className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Assign delivery
          </button>

          <div className="grid gap-4">
            {assignments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">No delivery assignments yet</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment._id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-primary-600">{assignment.deliveryPerson}</p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Order #{assignment.order?._id?.slice(-8).toUpperCase()}</h2>
                      <p className="text-sm text-slate-500">{assignment.order?.address}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">{assignment.status}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusUpdate(assignment._id, status)}
                        disabled={assignment.status === status}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Delivery stats</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Active deliveries</span>
                <strong>{activeCount}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total assignments</span>
                <strong>{assignments.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Last assignment</span>
                <strong>{assignments[0]?.createdAt ? new Date(assignments[0].createdAt).toLocaleString() : '-'}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
