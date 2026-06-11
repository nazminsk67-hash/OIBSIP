export default function InventoryTable({ items = [], onUpdateStock, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-smooth">
        <thead>
          <tr>
            <th>Item</th>
            <th>Unit</th>
            <th>Stock</th>
            <th>Min</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td className="font-medium">{item.name}</td>
              <td className="capitalize">{item.unit || 'pcs'}</td>
              <td className="font-semibold">{item.stock}</td>
              <td>{item.minimumStock ?? item.alertThreshold ?? '-'}</td>
              <td>
                {item.status === 'out-of-stock' || item.stock <= 0
                  ? <span className="badge badge-danger">Out</span>
                  : (item.status === 'low-stock' || item.stock <= (item.minimumStock ?? item.alertThreshold ?? 0))
                    ? <span className="badge badge-pending">Low</span>
                    : <span className="badge badge-done">OK</span>
                }
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onUpdateStock?.(item)} className="btn-ghost text-xs py-1 px-3">Update stock</button>
                  <button onClick={() => onEdit?.(item)} className="btn-secondary text-xs py-1 px-3">Edit</button>
                  <button onClick={() => onDelete?.(item)} className="btn-danger text-xs py-1 px-3">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
