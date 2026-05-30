export default function InventoryTable({ items = [], onUpdate }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-smooth">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td className="font-medium">{item.name}</td>
              <td className="capitalize">{item.category}</td>
              <td className="font-semibold">{item.stock}</td>
              <td>
                {item.stock < 20
                  ? <span className="badge badge-pending">Low</span>
                  : <span className="badge badge-done">OK</span>
                }
              </td>
              <td className="text-right">
                <button
                  onClick={() => onUpdate(item)}
                  className="btn-ghost text-xs py-1 px-3"
                >
                  Update stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
