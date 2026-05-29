import SidebarItem from './SidebarItem'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ variant = 'admin', onClose }) {
  const { user, logout } = useAuth()

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/pizzas', label: 'Pizzas', icon: '🍕' },
    { to: '/admin/orders', label: 'Orders', icon: '🧾' },
    { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/dashboard', label: 'Notifications', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ]

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/pizzas', label: 'Pizza Menu', icon: '🍕' },
    { to: '/favorites', label: 'Favorites', icon: '⭐' },
    { to: '/cart', label: 'Cart', icon: '🛒' },
    { to: '/my-orders', label: 'Orders', icon: '🧾' },
    { to: '/dashboard', label: 'Notifications', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ]

  const links = variant === 'admin' ? adminLinks : userLinks

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col">
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <div className="font-bold">PizzaHub</div>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-auto">
        {links.map((l) => (
          <SidebarItem key={l.to} to={l.to} icon={l.icon} label={l.label} onClick={onClose} />
        ))}
      </nav>
      <div className="p-3 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
        <div className="mt-3">
          <button onClick={logout} className="w-full text-left text-sm text-red-600">Logout</button>
        </div>
      </div>
    </aside>
  )
}
