import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reviewApi } from '../../api/reviewApi'

const StarDisplay = ({ rating }) => (
  <div className="flex gap-1 text-amber-400">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star}>{star <= rating ? '★' : '☆'}</span>
    ))}
  </div>
)

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewApi.getAllReviews()
      setReviews(response.data || [])
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleHideReview = async (reviewId) => {
    try {
      await reviewApi.hideReview(reviewId)
      setReviews(reviews.map((r) => (r._id === reviewId ? { ...r, active: false } : r)))
      toast.success('Review hidden')
    } catch (err) {
      toast.error('Failed to hide review')
    }
  }

  const handleRestoreReview = async (reviewId) => {
    try {
      await reviewApi.restoreReview(reviewId)
      setReviews(reviews.map((r) => (r._id === reviewId ? { ...r, active: true } : r)))
      toast.success('Review restored')
    } catch (err) {
      toast.error('Failed to restore review')
    }
  }

  const handleToggleFeatured = async (reviewId) => {
    try {
      await reviewApi.toggleFeaturedReview(reviewId)
      setReviews(reviews.map((r) => (r._id === reviewId ? { ...r, featured: !r.featured } : r)))
      toast.success('Featured status updated')
    } catch (err) {
      toast.error('Failed to update featured status')
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'active') return r.active
    if (filter === 'hidden') return !r.active
    if (filter === 'featured') return r.featured
    return true
  })

  if (loading) {
    return (
      <div className="page-shell">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>
          Review management
        </p>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Customer Reviews
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Manage and moderate customer pizza reviews
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'hidden', 'featured'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'border'
            }`}
            style={{
              borderColor: filter === f ? 'transparent' : 'var(--border-color)',
              backgroundColor: filter === f ? undefined : 'var(--bg-secondary)',
              color: filter === f ? undefined : 'var(--text-primary)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({filteredReviews.length})
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p style={{ color: 'var(--text-tertiary)' }}>No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border p-6"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {review.user?.email}
                      </p>
                    </div>
                    {review.featured && (
                      <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-semibold">
                        ⭐ Featured
                      </span>
                    )}
                    {!review.active && (
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Pizza: <strong>{review.pizza?.name}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <StarDisplay rating={review.rating} />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {review.title && (
                <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {review.title}
                </p>
              )}

              {review.comment && (
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {review.comment}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                {review.active ? (
                  <button
                    onClick={() => handleHideReview(review._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    Hide
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestoreReview(review._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition"
                  >
                    Restore
                  </button>
                )}
                <button
                  onClick={() => handleToggleFeatured(review._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    review.featured
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {review.featured ? '★ Unfeature' : '☆ Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
