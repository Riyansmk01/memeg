import { POST } from '../../app/api/auth/register/route'

function createJsonRequest(url: string, data: any, method: string = 'POST'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

describe('Auth Register API', () => {
  it('should create user and return 201', async () => {
    const req = createJsonRequest('http://localhost/api/auth/register', {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    })

    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('userId')
  })

  it('should validate missing fields', async () => {
    const req = createJsonRequest('http://localhost/api/auth/register', {
      name: 'A',
      email: '',
      password: '',
    })
    const res = await POST(req as any)
    expect([400, 500]).toContain(res.status)
  })
})
