import api from './axiosConfig'

export const notificationApi = {
  getMyNotifications: (params) =>
    api.get('/notifications', { params }),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),

  getAdminNotifications: (params) =>
    api.get('/admin/notifications', { params }),

  markAdminRead: (id) =>
    api.patch(`/admin/notifications/${id}/read`),

  markAllAdminRead: () =>
    api.patch('/admin/notifications/read-all'),
}
