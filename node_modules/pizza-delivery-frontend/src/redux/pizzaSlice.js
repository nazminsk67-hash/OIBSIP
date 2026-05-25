import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { pizzaApi } from '../api/pizzaApi'

export const fetchPizzas = createAsyncThunk(
  'pizza/fetchPizzas',
  async (_, thunkAPI) => {
    try {
      const response = await pizzaApi.getAllPizzas()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchBuilderOptions = createAsyncThunk(
  'pizza/fetchBuilderOptions',
  async (_, thunkAPI) => {
    try {
      const response = await pizzaApi.getBuilderOptions()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createPizza = createAsyncThunk(
  'pizza/createPizza',
  async (payload, thunkAPI) => {
    try {
      const response = await pizzaApi.createPizza(payload)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updatePizza = createAsyncThunk(
  'pizza/updatePizza',
  async ({ id, payload }, thunkAPI) => {
    try {
      const response = await pizzaApi.updatePizza(id, payload)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deletePizza = createAsyncThunk(
  'pizza/deletePizza',
  async (id, thunkAPI) => {
    try {
      await pizzaApi.deletePizza(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  pizzas: [],
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPizzas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPizzas.fulfilled, (state, action) => {
        state.pizzas = action.payload
        state.loading = false
      })
      .addCase(fetchPizzas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchBuilderOptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBuilderOptions.fulfilled, (state, action) => {
        const { bases, sauces, cheeses, veggies } = action.payload
        state.bases   = bases   || []
        state.sauces  = sauces  || []
        state.cheeses = cheeses || []
        state.veggies = veggies || []
        state.loading = false
      })
      .addCase(fetchBuilderOptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createPizza.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPizza.fulfilled, (state, action) => {
        state.pizzas.unshift(action.payload)
        state.loading = false
      })
      .addCase(createPizza.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updatePizza.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePizza.fulfilled, (state, action) => {
        const idx = state.pizzas.findIndex(p => p._id === action.payload._id)
        if (idx !== -1) state.pizzas[idx] = action.payload
        state.loading = false
      })
      .addCase(updatePizza.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deletePizza.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePizza.fulfilled, (state, action) => {
        state.pizzas = state.pizzas.filter(p => p._id !== action.payload)
        state.loading = false
      })
      .addCase(deletePizza.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const selectPizzas         = (state) => state.pizza.pizzas
export const selectBases          = (state) => state.pizza.bases
export const selectSauces         = (state) => state.pizza.sauces
export const selectCheeses        = (state) => state.pizza.cheeses
export const selectVeggies        = (state) => state.pizza.veggies
export const selectPizzaLoading   = (state) => state.pizza.loading
export const selectPizzaError     = (state) => state.pizza.error

export default pizzaSlice.reducer
