import { createSlice } from '@reduxjs/toolkit'

const loadState = () => {
  try {
    const serialized = localStorage.getItem('cart')
    if (!serialized) return null
    return JSON.parse(serialized)
  } catch {
    return null
  }
}

const saveState = (state) => {
  try {
    localStorage.setItem('cart', JSON.stringify(state))
  } catch {
    // Ignore write failures
  }
}

const initialState = loadState() || {
  base: null,
  sauce: null,
  cheese: null,
  veggies: [],
  quantity: 1,
  totalPrice: 0,
  items: [],
}

const getItemLineTotal = (item) => {
  const toppingsTotal = (item.toppings || []).reduce((sum, t) => sum + (t.extraPrice || 0), 0)
  return ((item.sizePrice || 0) + toppingsTotal) * (item.quantity || 1)
}

const persist = (state) => {
  saveState(state)
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setBase: (state, action) => {
      state.base = action.payload
      const base = state.base?.price || 0
      const sauce = state.sauce?.price || 0
      const cheese = state.cheese?.price || 0
      const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
      state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
      persist(state)
    },
    setSauce: (state, action) => {
      state.sauce = action.payload
      const base = state.base?.price || 0
      const sauce = state.sauce?.price || 0
      const cheese = state.cheese?.price || 0
      const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
      state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
      persist(state)
    },
    setCheese: (state, action) => {
      state.cheese = action.payload
      const base = state.base?.price || 0
      const sauce = state.sauce?.price || 0
      const cheese = state.cheese?.price || 0
      const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
      state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
      persist(state)
    },
    toggleVeggie: (state, action) => {
      const exists = state.veggies.find(v => v.id === action.payload.id)
      if (exists) {
        state.veggies = state.veggies.filter(v => v.id !== action.payload.id)
      } else {
        state.veggies.push(action.payload)
      }
      const base = state.base?.price || 0
      const sauce = state.sauce?.price || 0
      const cheese = state.cheese?.price || 0
      const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
      state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
      persist(state)
    },
    setQuantity: (state, action) => {
      state.quantity = Math.max(1, action.payload)
      const base = state.base?.price || 0
      const sauce = state.sauce?.price || 0
      const cheese = state.cheese?.price || 0
      const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
      state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
      persist(state)
    },
    addItem: (state, action) => {
      const item = action.payload
      const key = JSON.stringify({ pizzaId: item.pizzaId, size: item.size, toppings: (item.toppings || []).map(t => t.ingredientId).sort() })
      const existing = state.items.find(i => i._key === key)
      if (existing) {
        existing.quantity += item.quantity || 1
        existing.lineTotal = getItemLineTotal(existing)
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
          lineTotal: getItemLineTotal({ ...item, quantity: item.quantity || 1 }),
          _key: key,
        })
      }
      persist(state)
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i._key !== action.payload)
      persist(state)
    },
    updateItemQuantity: (state, action) => {
      const { key, quantity } = action.payload
      const item = state.items.find(i => i._key === key)
      if (item) {
        item.quantity = Math.max(1, quantity)
        item.lineTotal = getItemLineTotal(item)
      }
      persist(state)
    },
    clearItems: (state) => {
      state.items = []
      persist(state)
    },
    resetCart: (state) => {
      const next = {
        base: null,
        sauce: null,
        cheese: null,
        veggies: [],
        quantity: 1,
        totalPrice: 0,
        items: [],
      }
      Object.assign(state, next)
      persist(state)
    },
  },
})

export const {
  setBase,
  setSauce,
  setCheese,
  toggleVeggie,
  setQuantity,
  addItem,
  removeItem,
  updateItemQuantity,
  clearItems,
  resetCart,
} = cartSlice.actions

export const selectCartBase      = (state) => state.cart.base
export const selectCartSauce     = (state) => state.cart.sauce
export const selectCartCheese    = (state) => state.cart.cheese
export const selectCartVeggies   = (state) => state.cart.veggies
export const selectCartQuantity  = (state) => state.cart.quantity
export const selectCartTotal     = (state) => state.cart.totalPrice
export const selectCartItems     = (state) => state.cart.items
export const selectCartIsReady   = (state) =>
  !!(state.cart.base && state.cart.sauce && state.cart.cheese)

export default cartSlice.reducer
