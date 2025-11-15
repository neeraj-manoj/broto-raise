'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, FileText, User, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StudentBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isComplaintsVisible, setIsComplaintsVisible] = useState(false)

  useEffect(() => {
    if (pathname !== '/dashboard') {
      setIsComplaintsVisible(false)
      return
    }

    const handleScroll = () => {
      const complaintsSection = document.getElementById('complaints-section')
      if (complaintsSection) {
        const rect = complaintsSection.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Consider section visible if any part is in viewport
        const isVisible = rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.3
        setIsComplaintsVisible(isVisible)
      }
    }

    // Check on mount and scroll
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const handleComplaintsClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (pathname === '/dashboard') {
      // If on dashboard, scroll to complaints section
      const complaintsSection = document.getElementById('complaints-section')
      if (complaintsSection) {
        complaintsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to dashboard with hash
      router.push('/dashboard#complaints-section')
    }
  }

  const homeLink = { href: '/dashboard', icon: Home, label: 'Home' }
  const complaintsLink = { icon: FileText, label: 'Complaints', onClick: handleComplaintsClick }
  const profileLink = { href: '/dashboard/profile', icon: User, label: 'Profile' }
  const settingsLink = { href: '/dashboard/settings', icon: Settings, label: 'Settings' }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 lg:hidden">
      <div className="grid grid-cols-5 items-center px-2 py-2 pb-safe">
        {/* Home */}
        <Link
          href={homeLink.href}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all",
            pathname === homeLink.href && !isComplaintsVisible
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <homeLink.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{homeLink.label}</span>
        </Link>

        {/* Complaints */}
        <button
          onClick={complaintsLink.onClick}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all",
            isComplaintsVisible
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <complaintsLink.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{complaintsLink.label}</span>
        </button>

        {/* Center - New Complaint Button (Glowing) */}
        <div className="flex justify-center">
          <Link
            href="/dashboard/new-complaint"
            className="relative flex flex-col items-center -mt-6"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />

            {/* Button */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all group">
              <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" />
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-white mt-1">New</span>
          </Link>
        </div>

        {/* Profile */}
        <Link
          href={profileLink.href}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all",
            pathname === profileLink.href
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <profileLink.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{profileLink.label}</span>
        </Link>

        {/* Settings */}
        <Link
          href={settingsLink.href}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all",
            pathname === settingsLink.href
              ? "bg-blue-500/20 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <settingsLink.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{settingsLink.label}</span>
        </Link>
      </div>
    </nav>
  )
}
