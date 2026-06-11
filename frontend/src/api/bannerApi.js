import api from './axiosConfig'

export const bannerApi = {
  getActiveBanners: () => api.get('/banners/active'),
  getBanners: () => api.get('/banners'),
  createBanner: (payload) => api.post('/banners', payload),
  updateBanner: (id, payload) => api.put(`/banners/${id}`, payload),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
  trackClick: (bannerId) => api.post(`/banners/click/${bannerId}`),
  getBannerStats: () => api.get('/banners/admin/stats'),
}
