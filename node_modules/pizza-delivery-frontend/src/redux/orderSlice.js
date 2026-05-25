import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { orderApi } from '../api/orderApi'

export const ORDER_STATUS = {
  RECEIVED:  'Order Received',
  KITCHEN:   'In the Kitchen',
  DELIVERY:  'Sent to Delivery',
  DELIVERED: 'Delivered',
}

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, thunkAPI) => {
    try {
      const response = await orderApi.getMyOrders()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (payload, thunkAPI) => {
    try {
      const response = await orderApi.placeOrder(payload)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (_, thunkAPI) => {
    try {
      const response = await orderApi.getAllOrders()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateOrderStatusAsync = createAsyncThunk(
  'order/updateOrderStatusAsync',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await orderApi.updateOrderStatus(id, status)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  orders:       [],
  currentOrder: null,
  loading:      false,
  error:        null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const idx = state.orders.findIndex(o => o._id === orderId)
      if (idx !== -1) state.orders[idx].status = status
      if (state.currentOrder?._id === orderId) {
        state.currentOrder.status = status
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.loading = false
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload)
        state.currentOrder = action.payload
        state.loading = false
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload
        state.loading = false
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateOrderStatusAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id)
        if (idx !== -1) state.orders[idx] = action.payload
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload
        }
        state.loading = false
      })
      .addCase(updateOrderStatusAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setCurrentOrder,
  updateOrderStatus,
  clearCurrentOrder,
} = orderSlice.actions

export const selectOrders       = (state) => state.order.orders
export const selectCurrentOrder = (state) => state.order.currentOrder
export const selectOrderLoading = (state) => state.order.loading
export const selectOrderError   = (state) => state.order.error

export default orderSlice.reducer
