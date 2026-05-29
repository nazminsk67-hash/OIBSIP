export default function InventoryTable({ items = [], onUpdate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Item</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Stock</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
            <th className="text-right py-3 px-4 text-gray-500 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
              <td className="py-3 px-4 text-gray-500 capitalize">{item.category}</td>
              <td className="py-3 px-4 font-semibold">{item.stock}</td>
              <td className="py-3 px-4">
                {item.stock < 20
                  ? <span className="badge badge-pending">Low</span>
                  : <span className="badge badge-done">OK</span>
                }
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onUpdate(item)}
                  className="text-xs btn-ghost py-1 px-3"
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
