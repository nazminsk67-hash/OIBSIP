import RewardTransaction from '../models/RewardTransaction.js'
import User from '../models/User.js'
import Settings from '../models/Settings.js'
import { getTierProgress, LOYALTY_TIERS } from '../services/LoyaltyTierService.js'

export const getRewardSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('rewardPoints totalOrders totalSpent')
    const settings = await Settings.findOne() || {}
    const rewardSettings = settings.rewards || {
      enabled: true,
      pointsPerRupee: 1,
      redemptionValuePerPoint: 0.5,
      minRedeemPoints: 10,
      maxRedeemPercentage: 20,
    }

    const transactions = await RewardTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)

    const totalOrders = user?.totalOrders || 0
    const totalSpent = user?.totalSpent || 0
    const tier = getTierProgress(totalOrders, totalSpent)

    res.json({
      rewardPoints: user?.rewardPoints || 0,
      totalOrders,
      totalSpent,
      tier,
      tiers: LOYALTY_TIERS,
      settings: rewardSettings,
      transactions,
    })
  } catch (err) {
    next(err)
  }
}

export const getRewardHistory = async (req, res, next) => {
  try {
    const transactions = await RewardTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(transactions)
  } catch (err) {
    next(err)
  }
}
