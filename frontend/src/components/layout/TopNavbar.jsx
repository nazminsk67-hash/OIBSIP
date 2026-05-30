import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '../common/ThemeToggle'
import NotificationCenter from '../common/NotificationCenter'
import { useAuth } from '../../hooks/useAuth'
import { adminApi } from '../../api/adminApi'

export default function TopNavbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ pizzas: [], users: [], orders: [] })
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    const term = query.trim()
    if (!term) {
      setResults({ pizzas: [], users: [], orders: [] })
      setSearchLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await adminApi.searchGlobal(term)
        setResults(response.data)
      } catch (err) {
        setResults({ pizzas: [], users: [], orders: [] })
      } finally {
        setSearchLoading(false)
      }
    }, 380)
    return () => clearTimeout(timer)
  }, [query, isAdmin])

  const hasResults = useMemo(
    () => results.pizzas.length || results.users.length || results.orders.length,
    [results]
  )

  return (
    <header className="h-16 navbar sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden navbar-button" onClick={onMenuToggle} aria-label="Open menu">
          ☰
        </button>
        <div className="hidden md:block text-lg font-semibold navbar-text">Dashboard</div>
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="hidden sm:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAdmin ? 'Search pizzas, users, orders...' : 'Search available to admins'}
            disabled={!isAdmin}
            className="input-field text-sm w-64"
          />
          {isAdmin && query.trim() && (
            <div className="absolute left-0 top-14 z-40 w-64 card card-compact">
              {searchLoading ? (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Searching...</p>
              ) : hasResults ? (
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {results.pizzas.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Pizzas</p>
                      <ul className="space-y-1">
                        {results.pizzas.map((pizza) => (
                          <li key={pizza._id} className="truncate hover:text-primary transition-colors">{pizza.name} — {pizza.category}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.users.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Users</p>
                      <ul className="space-y-1">
                        {results.users.map((user) => (
                          <li key={user._id} className="truncate hover:text-primary transition-colors">{user.name} — {user.email}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.orders.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Orders</p>
                      <ul className="space-y-1">
                        {results.orders.map((order) => (
                          <li key={order._id} className="truncate hover:text-primary transition-colors">#{order._id.slice(-8).toUpperCase()} — {order.status}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No matching results</p>
              )}
            </div>
          )}
        </div>
        <ThemeToggle />
        <NotificationCenter />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" 
               style={{ 
                 backgroundColor: 'var(--accent-light)',
                 color: 'var(--accent-primary)'
               }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={logout} className="text-sm font-medium hidden sm:block rounded-xl px-3 py-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
