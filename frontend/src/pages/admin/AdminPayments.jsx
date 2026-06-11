import React, { useEffect, useState } from 'react'
import { paymentApi } from '../../api/paymentApi'
import { formatDateTime } from '../../utils/helpers'

const eventColors = {
  payment_success: 'text-emerald-700 bg-emerald-50',
  verification_success: 'text-emerald-700 bg-emerald-50',
  order_placed_paid: 'text-emerald-700 bg-emerald-50',
  payment_failure: 'text-red-700 bg-red-50',
  verification_failure: 'text-red-700 bg-red-50',
  payment_initiated: 'text-amber-700 bg-amber-50',
  order_placed_pending: 'text-slate-700 bg-slate-50',
}

export default function AdminPayments() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await paymentApi.getAuditLogs({ limit: 100 })
        setAudits(data.audits || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payment audits')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="page-shell animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        <h2 className="text-xl font-semibold">Payment audit unavailable</h2>
        <p className="mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-primary-600">Payments</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payment audit log</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Razorpay verification, success, and failure events. Orders are never marked paid before signature verification.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Razorpay Order</th>
                <th className="px-4 py-3 font-semibold">Payment ID</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No payment events recorded yet.
                  </td>
                </tr>
              ) : (
                audits.map((row) => (
                  <tr key={row._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${eventColors[row.event] || 'bg-slate-100 text-slate-700'}`}>
                        {row.event?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.user?.name || '—'}
                      <div className="text-xs text-slate-500">{row.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.razorpayOrderId || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.razorpayPaymentId || '—'}</td>
                    <td className="px-4 py-3">{row.amount != null ? `₹${Number(row.amount).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 capitalize">{row.paymentStatus || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
