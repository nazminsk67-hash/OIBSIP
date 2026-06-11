import { NavLink } from 'react-router-dom'

export default function SidebarItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'sidebar-item-active' : 'sidebar-item'}`
      }
    >
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  )
}
