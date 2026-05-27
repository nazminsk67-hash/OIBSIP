import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAdmin, selectIsAuthenticated } from '../../redux/authSlice'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const user            = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin         = useSelector(selectIsAdmin)
  const { logout }      = useAuth()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <span className="font-bold text-gray-900">
              Pizza<span className="text-primary-500">Hub</span>
            </span>
            {isAdmin && (
              <span className="text-xs bg-primary-100 text-primary-700 font-medium px-2 py-0.5 rounded-full ml-1">
                Admin
              </span>
            )}
          </Link>

          {/* Nav links */}
          {isAuthenticated && (
            <div className="flex items-center gap-6">
              {!isAdmin && (
                <>
                  <Link to="/dashboard"  className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Menu</Link>
                  <Link to="/favorites" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Favorites</Link>
                  <Link to="/profile"    className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Profile</Link>
                  <Link to="/my-orders"  className="text-sm text-gray-600 hover:text-primary-500 transition-colors">My Orders</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Dashboard</Link>
                  <Link to="/admin/pizzas"    className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Pizzas</Link>
                  <Link to="/admin/orders"    className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Orders</Link>
                  <Link to="/admin/inventory" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Inventory</Link>
                </>
              )}

              {/* User menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
