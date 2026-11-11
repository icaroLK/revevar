import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { DownloadFlowProvider } from '../features/download/DownloadFlowProvider'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState<string | null>(null)
  const location = useLocation()

  // Close the mobile menu whenever the route changes (spec §3.2). Adjusting
  // state during render when a prop changes, rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    if (menuOpen) setMenuOpen(false)
  }

  return (
    <DownloadFlowProvider>
      <div className="flex min-h-screen flex-col">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
        <ScrollRestoration />
      </div>
    </DownloadFlowProvider>
  )
}
