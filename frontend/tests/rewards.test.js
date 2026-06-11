import { getTierByPoints } from '../src/utils/loyaltyTiers'

describe('Rewards loyalty tiers', () => {
  it('returns bronze for low points', () => {
    const tier = getTierByPoints(0)
    expect(tier.id).toBe('bronze')
  })

  it('returns higher tier for more points', () => {
    const low = getTierByPoints(10)
    const high = getTierByPoints(10000)
    expect(high.minPoints).toBeGreaterThan(low.minPoints)
  })
})
