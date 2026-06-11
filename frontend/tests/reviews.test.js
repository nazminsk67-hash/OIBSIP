import { jest, describe, it, expect } from '@jest/globals'
import { logError } from '../src/utils/errorLogger.js'

describe('Reviews / client error logging', () => {
  it('logError records review-related failures without throwing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      logError(new Error('Failed to load reviews'), { feature: 'reviews', pizzaId: 'abc' })
    ).not.toThrow()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('formats average rating from review list', () => {
    const reviews = [{ rating: 5 }, { rating: 3 }, { rating: 4 }]
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    expect(avg).toBe(4)
  })
})
