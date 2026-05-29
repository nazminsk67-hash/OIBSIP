import api from './axiosConfig'

export const authApi = {
  register: (data) =>
    api.post('/auth/register', data),

  login: (data) =>
    api.post('/auth/login', data),

  adminLogin: (data) =>
    api.post('/auth/admin/login', data),

  verifyEmail: (token) =>
    api.get(`/auth/verify-email/${token}`),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),

  getMe: () =>
    api.get('/auth/me'),
  updateProfile: (data) =>
    api.patch('/auth/me', data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/me/password', { currentPassword, newPassword }),
  getFavorites: () =>
    api.get('/auth/favorites'),
  addFavorite: (pizzaId) =>
    api.post(`/auth/favorites/${pizzaId}`),
  removeFavorite: (pizzaId) =>
    api.delete(`/auth/favorites/${pizzaId}`),
}
