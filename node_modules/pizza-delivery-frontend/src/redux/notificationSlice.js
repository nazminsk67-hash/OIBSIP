import { createSlice, nanoid } from '@reduxjs/toolkit'

const STORAGE_KEY = 'pd_notifications_v1'

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load notifications from storage', e)
    return []
  }
}

const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save notifications to storage', e)
  }
}

const initialState = {
  items: loadFromStorage(),
}

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action) {
        state.items.unshift(action.payload)
        // keep size reasonable
        if (state.items.length > 200) state.items.length = 200
        saveToStorage(state.items)
      },
      prepare({ type = 'info', title = '', message = '', data = null }) {
        return {
          payload: {
            id: nanoid(),
            type,
            title,
            message,
            data,
            read: false,
            createdAt: new Date().toISOString(),
          },
        }
      },
    },
    markRead(state, action) {
      const id = action.payload
      const it = state.items.find((n) => n.id === id)
      if (it) it.read = true
      saveToStorage(state.items)
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true))
      saveToStorage(state.items)
    },
    removeNotification(state, action) {
      const id = action.payload
      state.items = state.items.filter((n) => n.id !== id)
      saveToStorage(state.items)
    },
    clearNotifications(state) {
      state.items = []
      saveToStorage(state.items)
    },
  },
})

export const {
  addNotification,
  markRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} = slice.actions

export const selectNotifications = (state) => state.notifications.items
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length

export default slice.reducer
