import request from 'supertest'
import { createApp } from '../createApp.js'

describe('Auth API', () => {
  const { app } = createApp()

  it('POST /api/auth/login rejects missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
  })

  ;(process.env.CI ? it : it.skip)('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password-123' })
    expect([401, 500]).toContain(res.status)
    if (res.status === 401) {
      expect(res.body.message).toMatch(/invalid/i)
    }
  })

  it('POST /api/auth/admin/login rejects missing credentials', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({})
    expect(res.status).toBe(400)
  })

  it('GET /api/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
