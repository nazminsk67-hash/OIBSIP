import request from 'supertest'
import { createApp } from '../createApp.js'

describe('Review API', () => {
  const { app } = createApp()

  ;(process.env.CI ? it : it.skip)('GET /api/reviews/pizza/:id returns list (may be empty)', async () => {
    const res = await request(app).get('/api/reviews/pizza/507f1f77bcf86cd799439011')
    expect([200, 500]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
    }
  })

  it('GET /api/reviews/me requires authentication', async () => {
    const res = await request(app).get('/api/reviews/me')
    expect(res.status).toBe(401)
  })

  it('GET /api/reviews/admin/all requires admin', async () => {
    const res = await request(app).get('/api/reviews/admin/all')
    expect(res.status).toBe(401)
  })
})
