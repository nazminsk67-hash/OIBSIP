export const LOYALTY_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minOrders: 0,
    minSpent: 0,
    maxOrders: 4,
    maxSpent: 1999,
    emoji: '🥉',
    benefits: ['Welcome bonus', 'Birthday surprise'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minOrders: 5,
    minSpent: 2000,
    maxOrders: 14,
    maxSpent: 7999,
    emoji: '🥈',
    benefits: ['Priority support', '5% extra rewards', 'Early access to deals'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minOrders: 15,
    minSpent: 8000,
    maxOrders: 49,
    maxSpent: 24999,
    emoji: '🥇',
    benefits: ['10% extra rewards', 'VIP support', 'Exclusive pizzas', 'Free delivery on orders'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minOrders: 50,
    minSpent: 25000,
    maxOrders: Infinity,
    maxSpent: Infinity,
    emoji: '💎',
    benefits: [
      '15% extra rewards',
      '24/7 dedicated support',
      'Exclusive menu items',
      'Free delivery always',
      'Priority order fulfillment',
    ],
  },
]

export const getTierForUser = (totalOrders = 0, totalSpent = 0) => {
  let current = LOYALTY_TIERS[0]
  for (const tier of LOYALTY_TIERS) {
    if (totalOrders >= tier.minOrders && totalSpent >= tier.minSpent) {
      current = tier
    }
  }
  return current
}

export const getTierProgress = (totalOrders = 0, totalSpent = 0) => {
  const currentTier = getTierForUser(totalOrders, totalSpent)
  const idx = LOYALTY_TIERS.findIndex((t) => t.id === currentTier.id)
  const nextTier = LOYALTY_TIERS[idx + 1] || null

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      ordersNeeded: 0,
      spentNeeded: 0,
      totalOrders,
      totalSpent,
    }
  }

  const orderProgress = Math.min(
    100,
    ((totalOrders - currentTier.minOrders) / (nextTier.minOrders - currentTier.minOrders)) * 100
  )
  const spentProgress = Math.min(
    100,
    ((totalSpent - currentTier.minSpent) / (nextTier.minSpent - currentTier.minSpent)) * 100
  )
  const progress = Math.round((orderProgress + spentProgress) / 2)

  return {
    currentTier,
    nextTier,
    progress: Math.max(0, Math.min(100, progress)),
    ordersNeeded: Math.max(0, nextTier.minOrders - totalOrders),
    spentNeeded: Math.max(0, nextTier.minSpent - totalSpent),
    totalOrders,
    totalSpent,
    rewardsUnlocked: currentTier.benefits,
  }
}
