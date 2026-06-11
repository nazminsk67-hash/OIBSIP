import React, { useEffect, useState } from 'react'
import { reviewApi } from '../../api/reviewApi'

const StarDisplay = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'lg' ? 'text-lg' : 'text-sm'
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function PizzaReviews({ pizzaId, compact = false }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ average: 0, count: 0 })

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        const response = await reviewApi.getReviewsByPizza(pizzaId)
        const data = response.data || []
        setReviews(data)

        if (data.length > 0) {
          const avg = (data.reduce((sum, r) => sum + r.rating, 0) / data.length).toFixed(1)
          setStats({ average: avg, count: data.length })
        }
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setLoading(false)
      }
    }

    if (pizzaId) {
      loadReviews()
    }
  }, [pizzaId])

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    )
  }

  if (!reviews.length) {
    return (
      <div className="text-sm text-slate-500">
        No reviews yet
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <StarDisplay rating={Math.round(stats.average)} size="lg" />
          <span className="text-sm font-semibold">{stats.average}</span>
          <span className="text-xs text-slate-500">({stats.count} reviews)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Customer Reviews</h3>
        <div className="flex items-center gap-3">
          <StarDisplay rating={Math.round(stats.average)} size="lg" />
          <span className="text-lg font-bold">{stats.average}</span>
          <span className="text-sm text-slate-600">based on {stats.count} reviews</span>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {reviews.slice(0, 5).map((review) => (
          <div
            key={review._id}
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-sm">{review.user?.name || 'Anonymous'}</p>
                <StarDisplay rating={review.rating} />
              </div>
              {review.featured && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  ⭐ Featured
                </span>
              )}
            </div>
            {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
            {review.comment && <p className="text-sm text-slate-600 line-clamp-3">{review.comment}</p>}
          </div>
        ))}
      </div>

      {reviews.length > 5 && (
        <p className="text-xs text-slate-500 text-center">
          +{reviews.length - 5} more reviews
        </p>
      )}
    </div>
  )
}
