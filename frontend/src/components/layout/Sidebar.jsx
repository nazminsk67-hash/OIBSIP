import SidebarItem from './SidebarItem'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ variant = 'admin', onClose, isDrawer = false }) {
  const { user, logout } = useAuth()

  const adminLinks = [
    { to: '/admin/pizzas', label: 'Pizza Management', icon: '🍕' },
    { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
    { to: '/admin/order-center', label: 'Order Center', icon: '🧾' },
    { to: '/admin/customers', label: 'Customers', icon: '👥' },
    { to: '/admin/delivery', label: 'Delivery', icon: '🚚' },
    { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📝' },
    { to: '/admin/payments', label: 'Payments', icon: '💳' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/system-health', label: 'Health', icon: '❤️' },
    { to: '/admin/monitoring', label: 'Monitoring', icon: '📡' },
    { to: '/admin/profile', label: 'Profile', icon: '👤' },
  ]

  const userLinks = [
    { to: '/pizzas', label: 'Pizza Menu', icon: '🍕' },
    { to: '/build-pizza', label: 'Build Your Own Pizza', icon: '🧑‍🍳' },
    { to: '/favorites', label: 'Favorites', icon: '⭐' },
    { to: '/cart', label: 'Cart', icon: '🛒' },
    { to: '/checkout', label: 'Checkout', icon: '💳' },
    { to: '/rewards', label: 'Rewards', icon: '🎁' },
    { to: '/my-orders', label: 'Orders', icon: '🧾' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ]

  const links = variant === 'admin' ? adminLinks : userLinks

  return (
    <aside className={`sidebar ${isDrawer ? 'sidebar-drawer' : 'sidebar-shell'}`}>
      <div className="sidebar-header flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🍕</span>
          <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>PizzaHub</div>
        </div>
        {isDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl p-2 text-lg leading-none md:hidden navbar-button"
            aria-label="Close menu"
          >
            ×
          </button>
        )}
      </div>
      <nav className="sidebar-nav min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {links.map((l) => (
          <SidebarItem key={`${variant}-${l.to}-${l.label}`} to={l.to} icon={l.icon} label={l.label} onClick={onClose} />
        ))}
      </nav>
      <div className="sidebar-footer shrink-0">
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
          <button type="button" onClick={logout} aria-label="Log out" className="w-full text-left text-sm font-medium py-2 rounded-2xl btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
