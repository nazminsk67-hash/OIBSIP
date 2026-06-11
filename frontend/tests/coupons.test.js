describe('Coupon discount logic', () => {
  const applyPercent = (subtotal, percent) => Math.round((subtotal * percent) / 100)
  const applyFlat = (subtotal, amount) => Math.min(subtotal, amount)

  it('calculates percentage discount', () => {
    expect(applyPercent(500, 10)).toBe(50)
  })

  it('caps flat discount at subtotal', () => {
    expect(applyFlat(100, 150)).toBe(100)
    expect(applyFlat(500, 100)).toBe(100)
  })
})
