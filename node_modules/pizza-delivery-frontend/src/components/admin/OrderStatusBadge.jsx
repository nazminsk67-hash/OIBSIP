import { getStatusClass } from '../../utils/helpers'

const ORDER_STATUSES = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered']

export default function OrderStatusBadge({ orderId, currentStatus, onUpdate }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={getStatusClass(currentStatus)}>{currentStatus}</span>
      <select
        defaultValue=""
        onChange={(e) => e.target.value && onUpdate(orderId, e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-400"
      >
        <option value="" disabled>Change status</option>
        {ORDER_STATUSES.filter(s => s !== currentStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  )
}
