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
    <nav
      className="fixed inset-x-0 bottom-4 z-50 md:hidden px-4 pb-[max(env(safe-area-inset-bottom),0.25rem)]"
      aria-label="Primäre Navigation"
    >
      <div
        className="mx-auto max-w-md rounded-full border border-white/30 bg-white/60 backdrop-blur-lg shadow-[0_12px_40px_rgba(0,0,0,0.18)] saturate-150"
      >
        <ul className="grid grid-cols-3 items-center justify-between px-4 py-3">
          {navigationItems.map((item) => {
            const active = isActive(item.href)
            const IconComponent = item.icon

            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-full px-3 py-1.5 text-center text-[13px] font-medium transition-all duration-200 ease-out",
                    "hover:opacity-95 active:scale-[0.97]",
                    active ? "text-[#F89813]" : "text-[#6B7280]"
                  )}
                >
                  <IconComponent
                    size={24}
                    className={cn(
                      "transition-colors duration-200",
                      active ? "text-[#F89813]" : "text-[#6B7280]"
                    )}
                  />
                  <span className="leading-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
