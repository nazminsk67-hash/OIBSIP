import api from './axiosConfig'

export const paymentApi = {
  getAuditLogs: (params) =>
    api.get('/admin/payments/audit', { params }),
}
