'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { MessageSquareWarning, Home, Users, LayoutDashboard, User as UserIcon, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { NotificationsDropdown } from '../dashboard/notifications-dropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SuperAdminHeaderProps {
  user: User
  profile: any
}

export function SuperAdminHeader({ user, profile }: SuperAdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Scaled down on mobile */}
          <Link href="/super-admin" className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity">
            <MessageSquareWarning className="h-5 w-5 md:h-7 md:w-7 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-base md:text-2xl font-black font-mono">
                <span className="bg-white text-gray-900 px-1">BRO</span>TORAISE
              </span>
              <span className="text-[10px] md:text-xs text-purple-400 font-mono">SUPER ADMIN PANEL</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/super-admin">
              <Button
                variant="ghost"
                className={`gap-2 ${
                  isActive('/super-admin')
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/super-admin/admins">
              <Button
                variant="ghost"
                className={`gap-2 ${
                  isActive('/super-admin/admins')
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                Admin Management
              </Button>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Analytics Button */}
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 hidden md:flex">
              <Link href="/admin/analytics">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>

            {/* Notifications */}
            <NotificationsDropdown userId={user.id} />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild suppressHydrationWarning>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full p-0 h-10 w-10"
                  suppressHydrationWarning
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      priority
                    />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-white/10 text-white">
                <DropdownMenuLabel className="font-mono">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          priority
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'Super Admin'}</p>
                      <p className="text-xs text-gray-400 font-normal truncate">{user?.email}</p>
                      <p className="text-xs text-purple-400 font-bold uppercase">{profile?.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/super-admin/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/super-admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
