import { createSlice } from '@reduxjs/toolkit'

// Order status enum (matches backend)
export const ORDER_STATUS = {
  RECEIVED:  'Order Received',
  KITCHEN:   'In the Kitchen',
  DELIVERY:  'Sent to Delivery',
  DELIVERED: 'Delivered',
}

const initialState = {
  orders:       [],      // all orders (admin view)
  currentOrder: null,    // active user order being tracked
  loading:      false,
  error:        null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders  = action.payload
      state.loading = false
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload)
      state.currentOrder = action.payload
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    // Called when socket emits a status update
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload

      // Update in the orders list
      const idx = state.orders.findIndex(o => o._id === orderId)
      if (idx !== -1) state.orders[idx].status = status

      // Update the tracked order
      if (state.currentOrder?._id === orderId) {
        state.currentOrder.status = status
      }
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload
    },
    setOrderError: (state, action) => {
      state.error   = action.payload
      state.loading = false
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
})

export const {
  setOrders,
  addOrder,
  setCurrentOrder,
  updateOrderStatus,
  setOrderLoading,
  setOrderError,
  clearCurrentOrder,
} = orderSlice.actions

// Selectors
export const selectOrders       = (state) => state.order.orders
export const selectCurrentOrder = (state) => state.order.currentOrder
export const selectOrderLoading = (state) => state.order.loading

export default orderSlice.reducer
