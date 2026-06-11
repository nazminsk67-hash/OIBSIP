import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import MobileSidebar from './MobileSidebar'
import SkipToContent from '../common/SkipToContent'

export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeDrawer = () => setMobileOpen(false)
  const toggleDrawer = () => setMobileOpen((open) => !open)

  return (
    <div className="page-wrapper app-layout">
      <SkipToContent />

      <div className="sidebar-desktop-wrap" aria-hidden={mobileOpen}>
        <Sidebar variant="user" />
      </div>

      <div className={`app-layout-main ${mobileOpen ? 'app-layout-main--locked' : ''}`}>
        <TopNavbar mobileOpen={mobileOpen} onMenuToggle={toggleDrawer} />
        <main
          id="main-content"
          className="app-layout-content"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          tabIndex={-1}
          aria-hidden={mobileOpen}
        >
          <Outlet />
        </main>
      </div>

      <MobileSidebar open={mobileOpen} onClose={closeDrawer}>
        <Sidebar variant="user" isDrawer onClose={closeDrawer} />
      </MobileSidebar>
    </div>
  )
}
