import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { rewardApi } from '../../api/rewardApi'
import { getTierByPoints, getTierProgress, LOYALTY_TIERS } from '../../utils/loyaltyTiers'
import { formatDateTime } from '../../utils/helpers'

export default function Rewards() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRewards = async () => {
      try {
        setLoading(true)
        const response = await rewardApi.getMyRewards()
        setSummary(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load rewards')
        toast.error('Unable to fetch reward summary')
      } finally {
        setLoading(false)
      }
    }

    loadRewards()
  }, [])

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

  if (error || !summary) {
    return (
      <div className="page-shell rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
        <h2 className="text-2xl font-semibold">Rewards unavailable</h2>
        <p className="mt-3">{error || 'Unable to load your rewards.'}</p>
      </div>
    )
  }

  const { rewardPoints, settings, transactions, tier: apiTier, totalOrders, totalSpent } = summary
  const currentTier = apiTier?.currentTier || getTierByPoints(rewardPoints)
  const tierProgress = apiTier || getTierProgress(rewardPoints)
  const tierStyle = {
    color: currentTier.color || '#CD7F32',
    lightColor: currentTier.lightColor || '#FDF0ED',
  }
  const progressHint = tierProgress.ordersNeeded != null
    ? `${tierProgress.ordersNeeded} more orders · ₹${(tierProgress.spentNeeded || 0).toLocaleString('en-IN')} spend to reach ${tierProgress.nextTier?.name}`
    : `${tierProgress.pointsNeeded || 0} points until ${tierProgress.nextTier?.name}`

  return (
    <div className="page-shell space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Rewards</p>
        <h1 className="text-3xl font-semibold text-slate-900">Your reward balance</h1>
        <p className="max-w-2xl text-slate-600">
          Track points earned from orders and see how much you can redeem on your next pizza.
          {totalOrders != null && (
            <span className="block mt-1 text-sm">
              {totalOrders} orders · ₹{(totalSpent || 0).toLocaleString('en-IN')} lifetime spend
            </span>
          )}
        </p>
      </div>

      {/* Loyalty Tier Section */}
      <div className="rounded-[2rem] border p-6 shadow-sm" style={{ backgroundColor: tierStyle.lightColor, borderColor: tierStyle.color }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.18em]" style={{ color: tierStyle.color }}>Your tier</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: tierStyle.color }}>{currentTier.emoji} {currentTier.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600 mb-1">{rewardPoints} reward points</p>
            <p className="text-lg font-semibold text-slate-900">{Math.round(tierProgress.progress)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        {tierProgress.nextTier && (
          <div className="mb-6">
            <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${tierProgress.progress}%`, backgroundColor: tierStyle.color }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-700">{progressHint}</p>
          </div>
        )}

        {/* Benefits */}
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">Tier Benefits</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {currentTier.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-lg">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tier Overview */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Tiers</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {LOYALTY_TIERS.map((tier) => {
            const isCurrentTier = tier.id === currentTier.id
            return (
              <div
                key={tier.id}
                className={`rounded-xl border-2 p-4 transition ${
                  isCurrentTier
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-center text-2xl mb-2">{tier.emoji}</p>
                <p className="text-center font-semibold text-slate-900">{tier.name}</p>
                <p className="text-center text-xs text-slate-600 mt-2">
                  {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? '∞' : tier.maxPoints.toLocaleString()} pts
                </p>
                {isCurrentTier && (
                  <div className="mt-3 text-center">
                    <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      Current
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Total points</p>
          <p className="mt-4 text-5xl font-semibold text-slate-900">{rewardPoints}</p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p>Earn {settings.pointsPerRupee || 1} points for every ₹1 spent.</p>
            <p>Redeem each point for ₹{Number(settings.redemptionValuePerPoint || 0.5).toFixed(2)}.</p>
            <p>Minimum redemption: {settings.minRedeemPoints || 10} points.</p>
            <p>Maximum redemption: {settings.maxRedeemPercentage || 20}% of order total.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <p className="text-sm text-slate-500">No reward activity yet.</p>
            ) : (
              transactions.slice(0, 6).map((tx) => (
                <div key={tx._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.type === 'earn' ? 'Earned points' : 'Redeemed points'}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${tx.type === 'earn' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {tx.type === 'earn' ? `+${tx.points}` : `-${tx.points}`}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{tx.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
