import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Pizza varieties shown on dashboard
  pizzas: [],

  // Builder options fetched from backend
  bases:   [],
  sauces:  [],
  cheeses: [],
  veggies: [],

  loading: false,
  error:   null,
}

const pizzaSlice = createSlice({
  name: 'pizza',
  initialState,
  reducers: {
    setPizzas: (state, action) => {
      state.pizzas  = action.payload
      state.loading = false
    },
    setBuilderOptions: (state, action) => {
      const { bases, sauces, cheeses, veggies } = action.payload
      state.bases   = bases   || []
      state.sauces  = sauces  || []
      state.cheeses = cheeses || []
      state.veggies = veggies || []
      state.loading = false
    },
    setPizzaLoading: (state, action) => {
      state.loading = action.payload
    },
    setPizzaError: (state, action) => {
      state.error   = action.payload
      state.loading = false
    },
  },
})

export const { setPizzas, setBuilderOptions, setPizzaLoading, setPizzaError } = pizzaSlice.actions

// Selectors
export const selectPizzas         = (state) => state.pizza.pizzas
export const selectBases          = (state) => state.pizza.bases
export const selectSauces         = (state) => state.pizza.sauces
export const selectCheeses        = (state) => state.pizza.cheeses
export const selectVeggies        = (state) => state.pizza.veggies
export const selectPizzaLoading   = (state) => state.pizza.loading

export default pizzaSlice.reducer
