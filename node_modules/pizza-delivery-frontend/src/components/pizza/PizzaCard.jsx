import { formatPrice } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'

export default function PizzaCard({ pizza }) {
  const navigate = useNavigate()
  return (
    <div className="card-hover" onClick={() => navigate('/build')}>
      <div className="h-40 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center mb-4 text-6xl">
        🍕
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{pizza.name}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pizza.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-primary-600 font-bold text-lg">{formatPrice(pizza.price)}</span>
        <button className="btn-primary py-1.5 px-4 text-sm">Order</button>
      </div>
    </div>
  )
}
