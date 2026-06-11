import Review from '../models/Review.js'
import Pizza from '../models/Pizza.js'
import { notifyAdminNewReview } from '../services/NotificationService.js'

export const getReviewsByPizza = async (req, res, next) => {
  try {
    const pizzaId = req.params.pizzaId
    const reviews = await Review.find({ pizza: pizzaId, active: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('pizza', 'name image')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

export const createReview = async (req, res, next) => {
  try {
    const { pizzaId, rating, title, comment } = req.body
    if (!pizzaId || !rating) {
      return res.status(400).json({ message: 'Pizza and rating are required' })
    }

    const pizza = await Pizza.findById(pizzaId)
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' })
    }

    const existing = await Review.findOne({ pizza: pizzaId, user: req.user._id })
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this pizza' })
    }

    const review = await Review.create({
      user: req.user._id,
      pizza: pizzaId,
      rating: Number(rating),
      title: title?.trim() || '',
      comment: comment?.trim() || '',
    })

    notifyAdminNewReview(pizza.name, Number(rating)).catch(() => {})

    res.status(201).json(review)
  } catch (err) {
    next(err)
  }
}

export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id })
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    if (rating) review.rating = Number(rating)
    if (typeof title !== 'undefined') review.title = title?.trim() || review.title
    if (typeof comment !== 'undefined') review.comment = comment?.trim() || review.comment
    await review.save()
    res.json(review)
  } catch (err) {
    next(err)
  }
}

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.json({ message: 'Review deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export const getAllReviews = async (_req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('pizza', 'name')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

export const hideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    )
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.json(review)
  } catch (err) {
    next(err)
  }
}

export const restoreReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    )
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.json(review)
  } catch (err) {
    next(err)
  }
}

export const toggleFeaturedReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    review.featured = !review.featured
    await review.save()
    res.json(review)
  } catch (err) {
    next(err)
  }
}
