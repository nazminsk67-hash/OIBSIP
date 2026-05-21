// Format price in INR
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

// Capitalize first letter
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

// Truncate long strings
export const truncate = (str, n = 50) =>
  str?.length > n ? str.slice(0, n) + '...' : str

// Format date
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

// Format datetime
export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

// Get order status badge class
export const getStatusClass = (status) => {
  const map = {
    'Order Received':  'badge-pending',
    'In the Kitchen':  'badge-kitchen',
    'Sent to Delivery':'badge-delivery',
    'Delivered':       'badge-done',
  }
  return map[status] || 'badge-pending'
}
