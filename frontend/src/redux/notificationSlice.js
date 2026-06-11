import { createSlice, nanoid } from '@reduxjs/toolkit'
import {
  filterNotificationsForRole,
  shouldAcceptNotification,
} from '../utils/notificationFilters'

const STORAGE_KEYS = {
  user: 'pd_notifications_user_v1',
  admin: 'pd_notifications_admin_v1',
}

const loadFromStorage = (role) => {
  const key = STORAGE_KEYS[role]
  if (!key) return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const items = JSON.parse(raw)
    return filterNotificationsForRole(items, role === 'admin')
  } catch (e) {
    console.error('Failed to load notifications from storage', e)
    return []
  }
}

const saveToStorage = (role, items) => {
  const key = STORAGE_KEYS[role]
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save notifications to storage', e)
  }
}

const initialState = {
  items: [],
  role: null,
}

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hydrateForRole(state, action) {
      const isAdmin = action.payload === 'admin'
      state.role = isAdmin ? 'admin' : 'user'
      state.items = loadFromStorage(state.role)
    },
    addNotification: {
      reducer(state, action) {
        if (!state.role) return
        const isAdmin = state.role === 'admin'
        if (!shouldAcceptNotification(action.payload, isAdmin)) return
        state.items.unshift(action.payload)
        if (state.items.length > 200) state.items.length = 200
        saveToStorage(state.role, state.items)
      },
      prepare({ type = 'info', title = '', message = '', data = null, audience = null }) {
        return {
          payload: {
            id: nanoid(),
            type,
            title,
            message,
            data,
            audience,
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
      saveToStorage(state.role, state.items)
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true))
      saveToStorage(state.role, state.items)
    },
    removeNotification(state, action) {
      const id = action.payload
      state.items = state.items.filter((n) => n.id !== id)
      saveToStorage(state.role, state.items)
    },
    clearNotifications(state) {
      state.items = []
      if (state.role) saveToStorage(state.role, state.items)
    },
    resetNotifications(state) {
      state.items = []
      state.role = null
    },
    syncFromServer(state, action) {
      if (!state.role) return
      const isAdmin = state.role === 'admin'
      const serverItems = action.payload || []
      for (const s of serverItems) {
        const mapped = {
          id: s._id || s.id,
          serverId: s._id || s.id,
          type: s.type || 'info',
          title: s.emoji ? `${s.emoji} ${s.title}` : s.title,
          message: s.message,
          data: s.data,
          audience: s.audience || (isAdmin ? 'admin' : 'user'),
          read: s.read || false,
          createdAt: s.createdAt || new Date().toISOString(),
        }
        if (!shouldAcceptNotification(mapped, isAdmin)) continue
        const sid = mapped.serverId
        if (!sid) continue
        const exists = state.items.some((n) => n.serverId === sid || n.id === sid)
        if (exists) continue
        state.items.unshift(mapped)
      }
      if (state.items.length > 200) state.items.length = 200
      saveToStorage(state.role, state.items)
    },
  },
})

export const {
  addNotification,
  markRead,
  markAllRead,
  removeNotification,
  clearNotifications,
  syncFromServer,
  hydrateForRole,
  resetNotifications,
} = slice.actions

export const selectNotifications = (state) => {
  const { items, role } = state.notifications
  if (!role) return []
  return filterNotificationsForRole(items, role === 'admin')
}

export const selectUnreadCount = (state) =>
  selectNotifications(state).filter((n) => !n.read).length

export default slice.reducer
