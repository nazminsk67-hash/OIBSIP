import request from 'supertest'
import { createApp } from '../createApp.js'

describe('Health API', () => {
  const { app } = createApp()

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })

  it('GET /api/health/metrics returns system metrics', async () => {
    const res = await request(app).get('/api/health/metrics')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.memory).toBeDefined()
    expect(res.body.cpu).toBeDefined()
  })

  it('GET /api/unknown returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })
})
