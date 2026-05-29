import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import MobileSidebar from './MobileSidebar'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar variant="admin" />
        <div className="flex-1 flex flex-col w-0">
          <TopNavbar onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar variant="admin" onClose={() => setMobileOpen(false)} />
      </MobileSidebar>
    </div>
  )
}
