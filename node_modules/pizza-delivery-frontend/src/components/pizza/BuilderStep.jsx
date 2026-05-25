import { formatPrice } from '../../utils/helpers'

export default function BuilderStep({ options = [], selected, onSelect, multi = false }) {
  const isSelected = (opt) =>
    multi
      ? selected?.some(s => s.id === opt._id)
      : selected?.id === opt._id

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map(opt => (
        <div
          key={opt._id}
          onClick={() => onSelect(opt)}
          className={`option-card ${isSelected(opt) ? 'option-card-selected' : ''}`}
        >
          <div className="text-3xl mb-2">{opt.emoji || '🍕'}</div>
          <p className="font-medium text-gray-900 text-sm">{opt.name}</p>
          <p className="text-xs text-primary-600 font-semibold mt-0.5">{formatPrice(opt.price)}</p>
          {opt.stock < 10 && (
            <p className="text-xs text-red-500 mt-1">Low stock</p>
          )}
        </div>
      ))}
    </div>
  )
}
