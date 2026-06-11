import React from 'react'
import { exportToCSV, exportToExcel } from '../../services/reportService'

function ExportButtons({ rows, filename }) {
  if (!rows || !rows.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => exportToCSV(rows, filename)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => exportToExcel(rows, filename)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        Export Excel
      </button>
    </div>
  )
}

export default React.memo(ExportButtons)
