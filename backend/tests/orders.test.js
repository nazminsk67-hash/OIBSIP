import request from 'supertest'
import { createApp } from '../createApp.js'

describe('Order API', () => {
  const { app } = createApp()

  it('GET /api/orders/my-orders requires authentication', async () => {
    const res = await request(app).get('/api/orders/my-orders')
    expect(res.status).toBe(401)
  })

  it('POST /api/orders/place requires authentication', async () => {
    const res = await request(app).post('/api/orders/place').send({})
    expect(res.status).toBe(401)
  })
})
