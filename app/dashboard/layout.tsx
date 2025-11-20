import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StudentBottomNav } from '@/components/shared/student-bottom-nav'
import { ScrollToHash } from '@/components/dashboard/scroll-to-hash'
import BroBotChatClient from '@/components/brobot/brobot-chat-client'
import { Suspense } from 'react'

export default async function DashboardLayout({
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

  // Calculate stats for BroBot (we might need to fetch this here if BroBot needs it globally)
  // Or we can let BroBot fetch its own stats or pass partial stats.
  // The original page fetched stats for BroBot.
  // Let's fetch basic stats here or just pass what we have.
  // BroBotChatClient takes `userStats`.
  
  const { count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)

  // We can't easily get full stats without fetching all complaints.
  // Let's fetch just the counts if possible, or fetch all complaints (lightweight if just status).
  const { data: complaints } = await supabase
    .from('complaints')
    .select('status')
    .eq('student_id', user.id)

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

        {children}

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
