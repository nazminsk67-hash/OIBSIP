import api from './axiosConfig'

export const orderApi = {
  // Create Razorpay order (returns order_id)
  createRazorpayOrder: (amount) =>
    api.post('/orders/create-payment', { amount }),

  // Verify payment and place order after Razorpay success
  placeOrder: (orderData) =>
    api.post('/orders/place', orderData),

  // Get current user's orders
  getMyOrders: () =>
    api.get('/orders/my-orders'),

  // Get single order by ID
  getOrderById: (orderId) =>
    api.get(`/orders/${orderId}`),

  // Admin: get all orders
  getAllOrders: () =>
    api.get('/orders'),

  // Admin: update order status
  updateOrderStatus: (orderId, status) =>
    api.patch(`/orders/${orderId}/status`, { status }),
}
