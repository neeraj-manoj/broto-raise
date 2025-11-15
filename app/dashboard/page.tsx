import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ComplaintsList } from '@/components/dashboard/complaints-list'
import { StudentBottomNav } from '@/components/shared/student-bottom-nav'
import { ScrollToHash } from '@/components/dashboard/scroll-to-hash'
import BroBotChatClient from '@/components/brobot/brobot-chat-client'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, avatar_url')
    .eq('id', user.id)
    .single()

  // Redirect admins to their proper dashboard
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Redirect super admins to their dashboard
  if (profile?.role === 'super_admin') {
    redirect('/super-admin')
  }

  // Get user's complaints with stats
  const { data: complaints, count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const stats = {
    total: count || 0,
    pending: complaints?.filter(c => c.status === 'new' || c.status === 'under_review').length || 0,
    inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0,
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <ScrollToHash />
        <DashboardHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black font-mono mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Manage your complaints and track their progress
            </p>
          </div>

          <Suspense fallback={<div className="animate-pulse h-32 bg-white/5 rounded-lg" />}>
            <DashboardStats stats={stats} />
          </Suspense>

          <Suspense fallback={<div className="animate-pulse h-64 bg-white/5 rounded-lg mt-8" />}>
            <ComplaintsList complaints={complaints || []} />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <BroBotChatClient
            userAvatarUrl={profile?.avatar_url}
            userRole={profile?.role}
            userName={profile?.full_name}
            currentPage="dashboard"
            userStats={stats}
          />
        </Suspense>

        <StudentBottomNav />
      </div>
    </div>
  )
}
