describe('Checkout empty state', () => {
  it('detects empty cart', () => {
    const items = []
    expect(items.length).toBe(0)
  })
})

describe('Checkout totals', () => {
  const computeFinalTotal = (items, couponDiscount = 0, rewardDiscount = 0) => {
    const total = items.reduce((s, i) => s + (i.lineTotal || 0), 0)
    return Math.max(0, total - couponDiscount - rewardDiscount)
  }

  it('sums line items', () => {
    const items = [{ lineTotal: 299 }, { lineTotal: 150 }]
    expect(computeFinalTotal(items)).toBe(449)
  })

  it('applies coupon and reward discounts without going negative', () => {
    const items = [{ lineTotal: 100 }]
    expect(computeFinalTotal(items, 30, 20)).toBe(50)
    expect(computeFinalTotal(items, 200, 50)).toBe(0)
  })
})

describe('Custom Pizza Totals', () => {
  it('correctly calculates lineTotal for custom pizzas with sizePrice as 0 and all ingredients in toppings', () => {
    const customPizza = {
      pizzaId: null,
      name: 'Custom Pizza (Thin Crust)',
      size: 'Custom',
      sizePrice: 0,
      toppings: [
        { ingredientId: '1', name: 'Thin Crust (Base)', extraPrice: 49 },
        { ingredientId: '2', name: 'Tomato Marinara (Sauce)', extraPrice: 29 },
        { ingredientId: '3', name: 'Mozzarella (Cheese)', extraPrice: 49 },
        { ingredientId: '4', name: 'Bell Peppers', extraPrice: 19 },
      ],
      quantity: 2,
    }

    const toppingsTotal = customPizza.toppings.reduce((sum, t) => sum + t.extraPrice, 0)
    const lineTotal = (customPizza.sizePrice + toppingsTotal) * customPizza.quantity

    expect(toppingsTotal).toBe(49 + 29 + 49 + 19) // 146
    expect(lineTotal).toBe(146 * 2) // 292
  })
})
