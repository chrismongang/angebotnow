'use client'

import { DesktopNavigation } from './desktop-navigation'
import { MobileNavigation } from './mobile-navigation'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <DesktopNavigation />
      <div className="pt-16 md:pt-16">
        {children}
      </div>
      <MobileNavigation />
    </>
  )
}
