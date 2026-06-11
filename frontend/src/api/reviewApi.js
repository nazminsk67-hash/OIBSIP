import api from './axiosConfig'

export const reviewApi = {
  getReviewsByPizza: (pizzaId) => api.get(`/reviews/pizza/${pizzaId}`),
  getMyReviews: () => api.get('/reviews/me'),
  addReview: (payload) => api.post('/reviews', payload),
  updateReview: (id, payload) => api.put(`/reviews/${id}`, payload),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getAllReviews: () => api.get('/reviews/admin/all'),
  hideReview: (id) => api.patch(`/reviews/admin/${id}/hide`),
  restoreReview: (id) => api.patch(`/reviews/admin/${id}/restore`),
  toggleFeaturedReview: (id) => api.patch(`/reviews/admin/${id}/featured`),
}
