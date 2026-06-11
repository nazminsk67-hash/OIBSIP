import authReducer, {
  setCredentials,
  logout,
  selectIsAuthenticated,
  selectIsAdmin,
} from '../src/redux/authSlice'

describe('authSlice', () => {
  it('starts unauthenticated without token', () => {
    const state = authReducer(undefined, { type: '@@INIT' })
    expect(state.isAuthenticated).toBe(false)
    expect(state.isAdmin).toBe(false)
  })

  it('setCredentials stores user and token', () => {
    const user = { _id: '1', name: 'Test', email: 't@example.com', role: 'user' }
    const state = authReducer(
      undefined,
      setCredentials({ user, token: 'abc123' })
    )
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('abc123')
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('setCredentials marks admin role', () => {
    const user = { _id: '2', name: 'Admin', email: 'a@example.com', role: 'admin' }
    const state = authReducer(
      undefined,
      setCredentials({ user, token: 'admin-token' })
    )
    expect(selectIsAdmin({ auth: state })).toBe(true)
  })

  it('logout clears session', () => {
    const loggedIn = authReducer(
      undefined,
      setCredentials({
        user: { role: 'user', name: 'U', email: 'u@e.com' },
        token: 'x',
      })
    )
    const state = authReducer(loggedIn, logout())
    expect(selectIsAuthenticated({ auth: state })).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})
