'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MessageSquareWarning, Settings, LogOut, User, LayoutDashboard } from 'lucide-react'
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

interface AdminHeaderProps {
  user: any
  profile: any
}

export function AdminHeader({ user, profile }: AdminHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Scaled down on mobile */}
          <Link href="/admin" className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity">
            <MessageSquareWarning className="h-5 w-5 md:h-7 md:w-7 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-base md:text-2xl font-black font-mono">
                <span className="bg-white text-gray-900 px-1">BRO</span>TORAISE
              </span>
              <span className={`text-[10px] md:text-xs font-mono ${
                profile?.role === 'super_admin' ? 'text-purple-400' : 'text-blue-400'
              }`}>
                {profile?.role === 'super_admin' ? 'SUPER ADMIN PANEL' : 'ADMIN PANEL'}
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Analytics Button */}
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 hidden md:flex h-9 md:h-10">
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
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-white/10 text-white">
                <DropdownMenuLabel className="font-mono">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <User className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</p>
                      <p className="text-xs text-gray-400 font-normal truncate">{user?.email}</p>
                      <p className={`text-xs font-bold uppercase ${
                        profile?.role === 'super_admin' ? 'text-purple-400' : 'text-blue-400'
                      }`}>
                        {profile?.role === 'super_admin' ? 'SUPER ADMIN' : profile?.role?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
