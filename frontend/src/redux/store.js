import { configureStore } from '@reduxjs/toolkit'
import authReducer      from './authSlice'
import cartReducer      from './cartSlice'
import pizzaReducer     from './pizzaSlice'
import orderReducer     from './orderSlice'
import favoritesReducer from './favoritesSlice'

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    cart:      cartReducer,
    pizza:     pizzaReducer,
    order:     orderReducer,
    favorites: favoritesReducer,
  },
})

export default store
