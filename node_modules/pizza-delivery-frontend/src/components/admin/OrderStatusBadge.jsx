const statusBadgeClasses = {
  'Order Received': 'inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800',
  'In the Kitchen': 'inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800',
  'Sent to Delivery': 'inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800',
  'Delivered': 'inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800',
}

export default function OrderStatusBadge({ status, large = false }) {
  const baseClasses = statusBadgeClasses[status] || 'inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800'
  
  if (large) {
    return (
      <div className={baseClasses.replace('text-sm', 'text-base').replace('px-3 py-1', 'px-4 py-2')}>
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-75" />
        {status}
      </div>
    )
  }

  return <span className={baseClasses}>{status}</span>
}
