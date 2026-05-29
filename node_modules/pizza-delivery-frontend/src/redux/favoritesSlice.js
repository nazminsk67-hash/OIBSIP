import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, thunkAPI) => {
    try {
      const response = await authApi.getFavorites()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (pizzaId, thunkAPI) => {
    try {
      const response = await authApi.addFavorite(pizzaId)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (pizzaId, thunkAPI) => {
    try {
      const response = await authApi.removeFavorite(pizzaId)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addFavorite.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const selectFavorites = (state) => state.favorites.items
export const selectFavoritesLoading = (state) => state.favorites.loading
export const selectFavoritesError = (state) => state.favorites.error

export default favoritesSlice.reducer
