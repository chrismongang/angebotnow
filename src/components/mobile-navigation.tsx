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

export function MobileNavigation() {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-50 md:hidden">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          const IconComponent = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                active
                  ? "text-[#F89813]" // Orange for active
                  : "text-gray-500 hover:text-gray-700" // Gray for inactive
              )}
            >
              <IconComponent
                size={24}
                className={cn(
                  "mb-1",
                  active
                    ? "text-[#F89813]"
                    : "text-gray-500"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
