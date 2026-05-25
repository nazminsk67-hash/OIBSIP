import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Step selections
  base:     null,   // { id, name, price }
  sauce:    null,   // { id, name, price }
  cheese:   null,   // { id, name, price }
  veggies:  [],     // [{ id, name, price }, ...]

  // Extras
  quantity: 1,

  // Computed
  totalPrice: 0,
  // Catalog cart items
  items: [], // [{ id, pizzaId, name, size, sizePrice, toppings:[], quantity, lineTotal }]
}

const calcTotal = (state) => {
  const base    = state.base?.price    || 0
  const sauce   = state.sauce?.price   || 0
  const cheese  = state.cheese?.price  || 0
  const veggies = state.veggies.reduce((sum, v) => sum + v.price, 0)
  state.totalPrice = (base + sauce + cheese + veggies) * state.quantity
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setBase: (state, action) => {
      state.base = action.payload
      calcTotal(state)
    },
    setSauce: (state, action) => {
      state.sauce = action.payload
      calcTotal(state)
    },
    setCheese: (state, action) => {
      state.cheese = action.payload
      calcTotal(state)
    },
    toggleVeggie: (state, action) => {
      const exists = state.veggies.find(v => v.id === action.payload.id)
      if (exists) {
        state.veggies = state.veggies.filter(v => v.id !== action.payload.id)
      } else {
        state.veggies.push(action.payload)
      }
      calcTotal(state)
    },
    setQuantity: (state, action) => {
      state.quantity = Math.max(1, action.payload)
      calcTotal(state)
    },
    resetCart: () => initialState,
    // Catalog cart reducers
    addItem: (state, action) => {
      const item = action.payload
      // try to merge by pizzaId+size+ toppings key
      const key = JSON.stringify({ pizzaId: item.pizzaId, size: item.size, toppings: (item.toppings||[]).map(t=>t.ingredientId).sort() })
      const existing = state.items.find(i => i._key === key)
      if (existing) {
        existing.quantity += item.quantity || 1
        existing.lineTotal = existing.quantity * (existing.sizePrice + (existing.toppings||[]).reduce((s,t)=>s+(t.extraPrice||0),0))
      } else {
        const newItem = {
          ...item,
          quantity: item.quantity || 1,
          lineTotal: (item.sizePrice || 0) * (item.quantity || 1) + ((item.toppings||[]).reduce((s,t)=>s+(t.extraPrice||0),0) * (item.quantity || 1)),
          _key: key,
        }
        state.items.push(newItem)
      }
    },
    removeItem: (state, action) => {
      const key = action.payload
      state.items = state.items.filter(i => i._key !== key)
    },
    updateItemQuantity: (state, action) => {
      const { key, quantity } = action.payload
      const item = state.items.find(i => i._key === key)
      if (item) {
        item.quantity = Math.max(1, quantity)
        item.lineTotal = item.quantity * (item.sizePrice + (item.toppings||[]).reduce((s,t)=>s+(t.extraPrice||0),0))
      }
    },
    clearItems: (state) => { state.items = [] },
  },
})

export const { setBase, setSauce, setCheese, toggleVeggie, setQuantity, resetCart, addItem, removeItem, updateItemQuantity, clearItems } = cartSlice.actions

// Selectors
export const selectCartBase      = (state) => state.cart.base
export const selectCartSauce     = (state) => state.cart.sauce
export const selectCartCheese    = (state) => state.cart.cheese
export const selectCartVeggies   = (state) => state.cart.veggies
export const selectCartQuantity  = (state) => state.cart.quantity
export const selectCartTotal     = (state) => state.cart.totalPrice
export const selectCartIsReady   = (state) =>
  !!(state.cart.base && state.cart.sauce && state.cart.cheese)

export default cartSlice.reducer
