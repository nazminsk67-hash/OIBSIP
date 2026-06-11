import React, { useState, useEffect } from 'react'
import { couponApi } from '../../api/couponApi'
import { formatPrice } from '../../utils/helpers'

const defaultRewardSettings = {
  pointsPerRupee: 1,
  redemptionValuePerPoint: 0.5,
  minRedeemPoints: 10,
  maxRedeemPercentage: 20,
}

export default function CouponRewardPanel({
  subtotal,
  rewardSummary,
  appliedCoupon,
  currentRedemption,
  onApplyCoupon,
  onClearCoupon,
  onRedeemPoints,
}) {
  const [code, setCode] = useState(appliedCoupon?.code || '')
  const [couponMessage, setCouponMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [rewardPoints, setRewardPoints] = useState(rewardSummary?.rewardPoints || 0)
  const [pointsToRedeem, setPointsToRedeem] = useState(currentRedemption?.pointsUsed || '')

  const settings = rewardSummary?.settings || defaultRewardSettings
  const redeemValue = Number(settings.redemptionValuePerPoint || defaultRewardSettings.redemptionValuePerPoint)
  const minRedeem = Number(settings.minRedeemPoints || defaultRewardSettings.minRedeemPoints)
  const maxRedeemPercent = Number(settings.maxRedeemPercentage || defaultRewardSettings.maxRedeemPercentage)
  const maxRedeemAmount = Math.max(0, subtotal * (maxRedeemPercent / 100))
  const maxRedeemPoints = Math.min(rewardPoints, Math.floor(maxRedeemAmount / redeemValue))
  const calculatedRewardDiscount = Number(pointsToRedeem || 0) * redeemValue

  useEffect(() => {
    setRewardPoints(rewardSummary?.rewardPoints || 0)
  }, [rewardSummary?.rewardPoints])

  useEffect(() => {
    setCode(appliedCoupon?.code || '')
  }, [appliedCoupon?.code])

  useEffect(() => {
    setPointsToRedeem(currentRedemption?.pointsUsed || '')
  }, [currentRedemption?.pointsUsed])

  const applyCoupon = async () => {
    if (!code.trim()) {
      setCouponMessage('Enter a coupon code to apply')
      return
    }

    setLoading(true)
    setCouponMessage('')
    try {
      const response = await couponApi.validateCoupon({ code: code.trim(), subtotal })
      const { coupon, discount } = response.data
      onApplyCoupon({ code: coupon.code, discount, couponId: coupon._id })
      setCouponMessage(`Coupon applied — saved ${formatPrice(discount)}.`)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to validate coupon'
      setCouponMessage(message)
      onClearCoupon()
    } finally {
      setLoading(false)
    }
  }

  const redeemRewards = () => {
    const points = Number(pointsToRedeem)
    if (!points || points <= 0) {
      setCouponMessage('Enter a valid number of points to redeem')
      return
    }
    if (points > rewardPoints) {
      setCouponMessage('You do not have enough reward points')
      return
    }
    if (points < minRedeem) {
      setCouponMessage(`Minimum redemption is ${minRedeem} points`) 
      return
    }
    if (calculatedRewardDiscount > maxRedeemAmount) {
      setCouponMessage(`You can redeem up to ${maxRedeemPoints} points for this order`) 
      return
    }

    onRedeemPoints({ pointsUsed: points, rewardDiscount: Math.round(calculatedRewardDiscount * 100) / 100 })
    setCouponMessage(`Redeemed ${points} points for ${formatPrice(calculatedRewardDiscount)} off`) 
  }

  const clearCoupon = () => {
    setCode('')
    setCouponMessage('Coupon removed')
    onClearCoupon()
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">Promotions & rewards</h3>
        <p className="mt-2 text-sm text-slate-500">Apply a coupon or redeem reward points to reduce your checkout total.</p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Coupon code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PIZZALOVE"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
          </label>
          <button
            type="button"
            onClick={applyCoupon}
            disabled={loading}
            className="btn-primary rounded-3xl px-5 py-3 text-sm font-semibold"
          >
            {loading ? 'Checking…' : 'Apply'}
          </button>
        </div>

        {appliedCoupon?.code && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-center justify-between gap-3">
              <p>
                Coupon <strong>{appliedCoupon.code}</strong> applied successfully.
              </p>
              <button
                type="button"
                onClick={clearCoupon}
                className="text-sm font-semibold text-primary-700 underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-medium text-slate-700">Reward points available</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{rewardPoints} points</p>
          </div>
          <button
            type="button"
            onClick={() => setPointsToRedeem(rewardPoints)}
            className="btn-secondary rounded-3xl px-5 py-3 text-sm font-semibold"
          >
            Max points
          </button>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Points to redeem</span>
          <input
            type="number"
            min="0"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            placeholder="Enter reward points"
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
          />
          <p className="mt-2 text-xs text-slate-500">
            {`Each point is worth ₹${redeemValue.toFixed(2)}. Redeem at least ${minRedeem} points, up to ${maxRedeemPoints} points (${maxRedeemPercent}% of order total).`}
          </p>
        </label>

        <button
          type="button"
          onClick={redeemRewards}
          className="btn-primary rounded-3xl px-5 py-3 text-sm font-semibold"
        >
          Redeem points
        </button>

        {couponMessage && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {couponMessage}
          </div>
        )}
      </div>
    </div>
  )
}
