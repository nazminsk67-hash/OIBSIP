import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reviewApi } from '../../api/reviewApi'
import { pizzaApi } from '../../api/pizzaApi'
import { formatDateTime } from '../../utils/helpers'

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange(star)}
        className={`text-2xl transition ${
          star <= value ? 'text-amber-400' : 'text-slate-300'
        } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-amber-300'}`}
      >
        ★
      </button>
    ))}
  </div>
)

export default function Reviews() {
  const [pizzas, setPizzas] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPizza, setSelectedPizza] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [pizzasRes, reviewsRes] = await Promise.all([pizzaApi.getAllPizzas(), reviewApi.getMyReviews()])
        setPizzas(pizzasRes.data || [])
        setMyReviews(reviewsRes.data || [])
      } catch (err) {
        toast.error('Unable to load reviews')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPizza || !comment.trim()) {
      toast.error('Please select a pizza and write a comment')
      return
    }

    setSubmitting(true)
    try {
      const payload = { pizzaId: selectedPizza, rating, comment: comment.trim() }
      if (editingReview) {
        await reviewApi.updateReview(editingReview._id, payload)
        toast.success('Review updated')
      } else {
        await reviewApi.addReview(payload)
        toast.success('Review submitted')
      }
      setSelectedPizza('')
      setRating(5)
      setComment('')
      setEditingReview(null)
      // Reload reviews
      const res = await reviewApi.getMyReviews()
      setMyReviews(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await reviewApi.deleteReview(reviewId)
      setMyReviews((prev) => prev.filter((r) => r._id !== reviewId))
      toast.success('Review deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete review')
    }
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setSelectedPizza(review.pizzaId)
    setRating(review.rating)
    setComment(review.comment)
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Community</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your reviews</h1>
        <p className="mt-2 text-slate-600">Share your pizza experience and help the community discover great flavors.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          {editingReview ? 'Edit your review' : 'Write a review'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span>Select pizza</span>
            <select
              value={selectedPizza}
              onChange={(e) => setSelectedPizza(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
            >
              <option value="">Choose a pizza</option>
              {pizzas.map((pizza) => (
                <option key={pizza._id} value={pizza._id}>
                  {pizza.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm">
            <span>Rating</span>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <label className="block space-y-2 text-sm">
            <span>Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this pizza..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
              rows={4}
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : editingReview ? 'Update review' : 'Submit review'}
            </button>
            {editingReview && (
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null)
                  setSelectedPizza('')
                  setRating(5)
                  setComment('')
                }}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Your reviews ({myReviews.length})</h2>
        {myReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-sm text-slate-500">You haven't written any reviews yet.</p>
          </div>
        ) : (
          myReviews.map((review) => (
            <div key={review._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{review.pizzaName}</p>
                  <StarRating value={review.rating} onChange={() => {}} readOnly />
                  <p className="mt-3 text-slate-700">{review.comment}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(review)}
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(review._id)} className="btn-danger text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
