import request from 'supertest'
import { createApp } from '../createApp.js'

describe('Coupon API', () => {
  const { app } = createApp()

  it('GET /api/coupons requires admin authentication', async () => {
    const res = await request(app).get('/api/coupons')
    expect(res.status).toBe(401)
  })

  it('POST /api/coupons/validate requires authentication', async () => {
    const res = await request(app).post('/api/coupons/validate').send({ code: 'TEST' })
    expect(res.status).toBe(401)
  })
})
