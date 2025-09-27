'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, FileText, Settings } from 'lucide-react'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/angebote', label: 'Angebote', icon: FileText },
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings }
]

export function DesktopNavigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/dashboard') {
      return pathname === href
    }
    
    // For /angebote, also match /angebot/[id] pages
    if (href === '/angebote') {
      return pathname === href || pathname.startsWith('/angebot/')
    }
    
    // For /einstellungen, also match /einstellungen/* pages
    if (href === '/einstellungen') {
      return pathname === href || pathname.startsWith('/einstellungen/')
    }
    
    return pathname === href
  }

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/favicon.svg" 
                  alt="AngebotNow Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-[#404040]">AngebotNow</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href)
              const IconComponent = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                    active
                      ? "bg-[#F89813]/10 text-[#F89813] border border-[#F89813]/20"
                      : "text-gray-600 hover:text-[#F89813] hover:bg-[#F89813]/5"
                  )}
                >
                  <IconComponent
                    size={20}
                    className={cn(
                      active
                        ? "text-[#F89813]"
                        : "text-gray-600"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
