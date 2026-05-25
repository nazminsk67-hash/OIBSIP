import { configureStore } from '@reduxjs/toolkit'
import authReducer  from './authSlice'
import cartReducer  from './cartSlice'
import pizzaReducer from './pizzaSlice'
import orderReducer from './orderSlice'

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    cart:  cartReducer,
    pizza: pizzaReducer,
    order: orderReducer,
  },
})

export default store
