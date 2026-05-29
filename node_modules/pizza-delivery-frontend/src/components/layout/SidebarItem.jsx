import { NavLink } from 'react-router-dom'

export default function SidebarItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md text-sm hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-semibold' : 'text-gray-700'}`}>
      <span className="text-lg">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  )
}
