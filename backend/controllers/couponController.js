import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'

const formatCouponCode = (code) => code?.toString().trim().toUpperCase()

const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || subtotal <= 0) return 0
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = (coupon.value / 100) * subtotal
  } else {
    discount = coupon.value
  }
  if (coupon.maxDiscount && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount)
  }
  return Math.max(0, Math.round(discount * 100) / 100)
}

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json(coupons)
  } catch (err) {
    next(err)
  }
}

export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount = 0,
      maxDiscount = 0,
      expiryDate,
      usageLimit = 0,
      perUserLimit = 1,
      active = true,
    } = req.body

    if (!code || !type || typeof value === 'undefined') {
      return res.status(400).json({ message: 'Coupon code, type, and value are required' })
    }

    const coupon = await Coupon.create({
      code: formatCouponCode(code),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: Number(maxDiscount),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: Number(usageLimit),
      perUserLimit: Number(perUserLimit),
      active,
      createdBy: req.user._id,
    })

    res.status(201).json(coupon)
  } catch (err) {
    next(err)
  }
}

export const updateCoupon = async (req, res, next) => {
  try {
    const updates = req.body
    if (updates.code) updates.code = formatCouponCode(updates.code)
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate)

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    res.json(coupon)
  } catch (err) {
    next(err)
  }
}

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }
    res.json({ message: 'Coupon deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export const activateCoupon = async (req, res, next) => {
  try {
    const { active } = req.body
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { active: Boolean(active) },
      { new: true }
    )
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }
    res.json(coupon)
  } catch (err) {
    next(err)
  }
}

export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }
    res.json(coupon)
  } catch (err) {
    next(err)
  }
}

export const getCouponUsage = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('usageHistory.user', 'name email')
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }
    res.json({ coupon, usageHistory: coupon.usageHistory })
  } catch (err) {
    next(err)
  }
}

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' })
    }

    if (typeof subtotal !== 'number' || subtotal <= 0) {
      return res.status(400).json({ message: 'Valid order subtotal is required' })
    }

    const coupon = await Coupon.findOne({ code: formatCouponCode(code) })
    if (!coupon || !coupon.active) {
      return res.status(404).json({ message: 'Coupon not found or inactive' })
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' })
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' })
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Order must be at least ${coupon.minOrderAmount.toFixed(2)} to use this coupon`,
      })
    }

    const userUsage = coupon.usageHistory.filter((history) =>
      history.user?.toString() === req.user._id.toString()
    ).length

    if (coupon.perUserLimit > 0 && userUsage >= coupon.perUserLimit) {
      return res.status(400).json({ message: 'Coupon can only be used once per user' })
    }

    const discount = calculateCouponDiscount(coupon, subtotal)
    res.json({
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        expiryDate: coupon.expiryDate,
        active: coupon.active,
      },
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
    })
  } catch (err) {
    next(err)
  }
}

export const getActiveCoupons = async (_req, res, next) => {
  try {
    const coupons = await Coupon.find({
      active: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: { $exists: false } },
      ],
    })
    res.json(coupons)
  } catch (err) {
    next(err)
  }
}

export const recordCouponUsage = async ({ couponId, userId, orderId, discount }) => {
  const coupon = await Coupon.findById(couponId)
  if (!coupon) return null
  coupon.usageCount += 1
  coupon.usageHistory.push({ user: userId, order: orderId, discountApplied: discount })
  return coupon.save()
}
