export const LOYALTY_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: '#CD7F32',
    lightColor: '#FDF0ED',
    emoji: '🥉',
    benefits: ['Welcome bonus', 'Birthday surprise'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    color: '#C0C0C0',
    lightColor: '#F8F8F8',
    emoji: '🥈',
    benefits: ['Priority support', '5% extra rewards', 'Early access to deals'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 4999,
    color: '#FFD700',
    lightColor: '#FFFEF0',
    emoji: '🥇',
    benefits: ['10% extra rewards', 'VIP support', 'Exclusive pizzas', 'Free delivery on orders'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: Infinity,
    color: '#E5E4E2',
    lightColor: '#FAFAF9',
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

export const getTierByPoints = (points) => {
  return LOYALTY_TIERS.find(
    (tier) => points >= tier.minPoints && points <= tier.maxPoints
  ) || LOYALTY_TIERS[0]
}

export const getTierProgress = (points) => {
  const tier = getTierByPoints(points)
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(tier) + 1]

  if (!nextTier) {
    return {
      currentTier: tier,
      nextTier: null,
      currentPoints: points,
      nextTierPoints: tier.maxPoints,
      progress: 100,
      pointsNeeded: 0,
    }
  }

  const pointsInTier = points - tier.minPoints
  const tierRange = nextTier.minPoints - tier.minPoints
  const progress = (pointsInTier / tierRange) * 100

  return {
    currentTier: tier,
    nextTier,
    currentPoints: points,
    nextTierPoints: nextTier.minPoints,
    progress: Math.min(progress, 100),
    pointsNeeded: Math.max(0, nextTier.minPoints - points),
  }
}

export const formatTierName = (tier) => {
  return `${tier.emoji} ${tier.name}`
}
