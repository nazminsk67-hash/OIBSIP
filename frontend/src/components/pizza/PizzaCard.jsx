import React from 'react'
import { formatPrice } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import ImageWithFallback from '../common/ImageWithFallback'
import FavoriteButton from '../common/FavoriteButton'

function PizzaCardInner({ pizza }) {
  const navigate = useNavigate()
  const price = pizza.sizes?.length
    ? Math.min(...pizza.sizes.map((s) => s.price || 0))
    : pizza.basePrice ?? pizza.price ?? 0
  const imageSrc = pizza.image || pizza.imageUrl || pizza.photo
  const category = pizza.category || 'Classic'
  const isVeg = /veg/i.test(pizza.category || '')
  const available = pizza.isAvailable ?? true

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => navigate(`/pizza/${pizza._id}`)}
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <ImageWithFallback src={imageSrc} alt={pizza.name} className="h-full w-full" />

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
            {category}
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm ${isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        <FavoriteButton pizza={pizza} className="absolute right-4 top-4" />

        {!available && (
          <span className="absolute left-4 bottom-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Unavailable
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{pizza.name}</h3>
          <p className="text-sm leading-6 text-slate-500 line-clamp-3">
            {pizza.description || 'A delicious pizza made with fresh ingredients.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Starting at</p>
            <p className="text-lg font-semibold text-primary-600">{formatPrice(price)}</p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/pizza/${pizza._id}`)
            }}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Order
          </button>
        </div>
      </div>
    </article>
  )
}

export default React.memo(PizzaCardInner)
