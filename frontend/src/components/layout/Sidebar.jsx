import SidebarItem from './SidebarItem'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ variant = 'admin', onClose }) {
  const { user, logout } = useAuth()

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/order-center', label: 'Order Center', icon: '🧾' },
    { to: '/admin/customers', label: 'Customers', icon: '👥' },
    { to: '/admin/delivery', label: 'Delivery', icon: '🚚' },
    { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📝' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/system-health', label: 'Health', icon: '❤️' },
    { to: '/admin/profile', label: 'Profile', icon: '👤' },
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
    <aside className="w-64 flex flex-col sidebar hidden md:flex">
      <div className="sidebar-header">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>PizzaHub</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <SidebarItem key={l.to} to={l.to} icon={l.icon} label={l.label} onClick={onClose} />
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" 
               style={{ 
                 backgroundColor: 'var(--accent-light)',
                 color: 'var(--accent-primary)'
               }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</div>
          </div>
        </div>
        <div className="mt-3">
          <button onClick={logout} className="w-full text-left text-sm font-medium py-2 rounded-2xl btn-secondary text-left">
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
