import api from './axiosConfig'

export const adminApi = {
  searchGlobal: (query) => api.get('/admin/search', { params: { q: query } }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getHealthMetrics: () => api.get('/admin/health'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getInventory: () => api.get('/admin/inventory'),
  createInventoryItem: (payload) => api.post('/admin/inventory', payload),
  updateInventoryItem: (id, payload) => api.put(`/admin/inventory/${id}`, payload),
  deleteInventoryItem: (id) => api.delete(`/admin/inventory/${id}`),
  getDeliveryAssignments: () => api.get('/admin/delivery/assignments'),
  createDeliveryAssignment: (payload) => api.post('/admin/delivery/assignments', payload),
  updateDeliveryAssignmentStatus: (id, status) => api.patch(`/admin/delivery/assignments/${id}/status`, { status }),
}
