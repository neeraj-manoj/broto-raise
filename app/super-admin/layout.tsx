import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SuperAdminHeader } from '@/components/super-admin/super-admin-header'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'
import BroBotChatClient from '@/components/brobot/brobot-chat-client'
import { Suspense } from 'react'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile and verify super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    // If admin, redirect to admin dashboard
    if (profile?.role === 'admin') {
      redirect('/admin')
    }
    // Otherwise redirect to student dashboard
    redirect('/dashboard')
  }

  // Fetch stats for BroBot (simplified)
  const { count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })

  const stats = {
    total: count || 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <SuperAdminHeader user={user} profile={profile} />

        {children}

        <Suspense fallback={null}>
          <BroBotChatClient
            userAvatarUrl={profile?.avatar_url}
            userRole={profile?.role}
            userName={profile?.full_name}
            currentPage="super-admin"
            userStats={stats}
          />
        </Suspense>

        <MobileBottomNav role="super_admin" />
      </div>
    </div>
  )
}
