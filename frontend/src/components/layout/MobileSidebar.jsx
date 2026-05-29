export default function MobileSidebar({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg">
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
