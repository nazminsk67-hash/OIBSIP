const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const flattenObject = (obj) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenObject(value)
      Object.entries(nested).forEach(([nestedKey, nestedValue]) => {
        acc[`${key}.${nestedKey}`] = nestedValue
      })
    } else {
      acc[key] = value
    }
    return acc
  }, {})

export const exportToCSV = (rows, filename) => {
  if (!rows || !rows.length) return
  const headers = Object.keys(flattenObject(rows[0]))
  const csv = [headers.join(','),
    ...rows.map((row) =>
      headers.map((key) => {
        const value = flattenObject(row)[key]
        const text = value === undefined || value === null ? '' : String(value).replace(/"/g, '""')
        return `"${text}"`
      }).join(',')
    )
  ].join('\r\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

export const exportToExcel = (rows, filename) => {
  if (!rows || !rows.length) return
  const headers = Object.keys(flattenObject(rows[0]))
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${headers
                    .map((key) => `<td>${(flattenObject(row)[key] ?? '').toString().replace(/</g, '&lt;')}</td>`)
                    .join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>`
  downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel')
}
