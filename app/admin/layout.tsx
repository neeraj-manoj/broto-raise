import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'
import BroBotChatClient from '@/components/brobot/brobot-chat-client'
import { Suspense } from 'react'

export default async function AdminLayout({
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

  // Get user profile and verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect super admins to their own dashboard
  if (profile?.role === 'super_admin') {
    redirect('/super-admin')
  }

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // Redirect non-admins to student dashboard
  }

  // Fetch stats for BroBot (simplified)
  const { count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })

  const stats = {
    total: count || 0,
    // We can't easily get other stats without fetching all complaints, 
    // but BroBot might not need detailed stats for admin view or we can pass 0.
    // Let's pass basic stats.
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
        <AdminHeader user={user} profile={profile} />

        {children}

        <Suspense fallback={null}>
          <BroBotChatClient
            userAvatarUrl={profile?.avatar_url}
            userRole={profile?.role}
            userName={profile?.full_name}
            currentPage="admin"
            userStats={stats}
          />
        </Suspense>

        <MobileBottomNav role="admin" />
      </div>
    </div>
  )
}
