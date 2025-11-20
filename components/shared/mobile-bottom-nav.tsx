'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, LayoutDashboard, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  role: 'admin' | 'super_admin'
}

export function MobileBottomNav({ role }: MobileNavProps) {
  const pathname = usePathname()

  const adminLinks = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  const superAdminLinks = [
    { href: '/super-admin', icon: Home, label: 'Dashboard' },
    { href: '/super-admin/admins', icon: Users, label: 'Admins' },
    { href: '/super-admin/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { href: '/super-admin/profile', icon: User, label: 'Profile' },
    { href: '/super-admin/settings', icon: Settings, label: 'Settings' },
  ]

  const links = role === 'super_admin' ? superAdminLinks : adminLinks
  const accentColor = role === 'super_admin' ? 'purple' : 'blue'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 lg:hidden">
      <div className="flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px]",
                isActive
                  ? `bg-${accentColor}-500/20 text-${accentColor}-400`
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              style={isActive ? {
                backgroundColor: accentColor === 'purple' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: accentColor === 'purple' ? 'rgb(192, 132, 252)' : 'rgb(96, 165, 250)'
              } : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
