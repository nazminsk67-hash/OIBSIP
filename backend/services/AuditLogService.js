import AuditLog from '../models/AuditLog.js'

export const recordAudit = async ({ adminId, action, entityType, entityId, details }) => {
  try {
    return await AuditLog.create({
      admin: adminId,
      action,
      entityType,
      entityId,
      details,
    })
  } catch (err) {
    console.error('Audit log error:', err.message)
    return null
  }
}
