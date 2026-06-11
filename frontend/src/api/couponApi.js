import api from './axiosConfig'

export const couponApi = {
  validateCoupon: (payload) => api.post('/coupons/validate', payload),
  getActiveCoupons: () => api.get('/coupons/active'),
  getCoupons: () => api.get('/coupons'),
  createCoupon: (payload) => api.post('/coupons', payload),
  updateCoupon: (id, payload) => api.put(`/coupons/${id}`, payload),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  activateCoupon: (id, active) => api.patch(`/coupons/${id}/activate`, { active }),
  getCouponUsage: (id) => api.get(`/coupons/${id}/usage`),
}
