import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import ExportButtons from '../../components/admin/ExportButtons'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const response = await adminApi.getAuditLogs()
        setLogs(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        toast.error('Unable to load audit logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const exportRows = logs.map((log) => ({
    admin: log.admin?.name,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    details: JSON.stringify(log.details),
    timestamp: log.createdAt,
  }))

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Audit Logs</p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Admin action history</h1>
          <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>Track pizza changes, inventory updates, and order workflow changes.</p>
        </div>
        <ExportButtons rows={exportRows} filename="audit_logs" />
      </div>

      <div className="card overflow-hidden rounded-3xl border">
        <table className="table-smooth">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={log._id}>
                <td className="font-medium">{log.admin?.name || 'Admin'}</td>
                <td>{log.action}</td>
                <td>{log.entityType} {log.entityId ? `#${log.entityId.slice(-8).toUpperCase()}` : ''}</td>
                <td className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{JSON.stringify(log.details)}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
