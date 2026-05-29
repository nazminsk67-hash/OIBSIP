import ThemeToggle from '../common/ThemeToggle'
import NotificationCenter from '../common/NotificationCenter'
import { useAuth } from '../../hooks/useAuth'

export default function TopNavbar({ onMenuToggle }) {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2" onClick={onMenuToggle} aria-label="Open menu">☰</button>
        <div className="hidden md:block text-lg font-semibold">Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <input placeholder="Search..." className="px-3 py-2 border rounded-md text-sm w-64" />
        </div>
        <ThemeToggle />
        <NotificationCenter />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">{user?.name?.[0]?.toUpperCase()}</div>
          <button onClick={logout} className="text-sm text-gray-600 hidden sm:block">Logout</button>
        </div>
      </div>
    </header>
  )
}
