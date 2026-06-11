import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '../common/ThemeToggle'
import NotificationCenter from '../common/NotificationCenter'
import { useAuth } from '../../hooks/useAuth'
import { adminApi } from '../../api/adminApi'

export default function TopNavbar({ mobileOpen = false, onMenuToggle }) {
  const { user } = useAuth()
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

  const searchResultsDropdown = (className = '') =>
    query.trim() ? (
      <div className={`card card-compact max-h-64 overflow-y-auto ${className}`}>
        {searchLoading ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Searching...</p>
        ) : hasResults ? (
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {results.pizzas.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Pizzas</p>
                <ul className="space-y-1">
                  {results.pizzas.map((pizza) => (
                    <li key={pizza._id} className="truncate">{pizza.name} — {pizza.category}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.users.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Users</p>
                <ul className="space-y-1">
                  {results.users.map((u) => (
                    <li key={u._id} className="truncate">{u.name} — {u.email}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.orders.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Orders</p>
                <ul className="space-y-1">
                  {results.orders.map((order) => (
                    <li key={order._id} className="truncate">#{order._id.slice(-8).toUpperCase()} — {order.status}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No matching results</p>
        )}
      </div>
    ) : null

  return (
    <header className="navbar min-h-16 px-3 py-2 sm:px-4">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className="navbar-button shrink-0 md:hidden"
              onClick={onMenuToggle}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xl shrink-0" aria-hidden="true">🍕</span>
              <span className="truncate text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                Pizza<span style={{ color: 'var(--accent-primary)' }}>Hub</span>
                {isAdmin && (
                  <span className="ml-1.5 hidden text-xs font-medium sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                    Admin
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>

        {isAdmin && (
          <div className="relative w-full min-w-0 md:max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pizzas, users, orders..."
              aria-label="Global admin search"
              className="input-field w-full min-w-0 text-sm"
            />
            {searchResultsDropdown('absolute left-0 right-0 top-12 z-50')}
          </div>
        )}
      </div>
    </header>
  )
}
