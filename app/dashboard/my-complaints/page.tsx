import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ComplaintsList } from '@/components/dashboard/complaints-list'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function MyComplaintsPage() {
  const supabase = await createServerSupabaseClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's complaints with stats
  const { data: complaints, count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const stats = {
    total: count || 0,
    pending: complaints?.filter(c => c.status === 'new' || c.status === 'under_review').length || 0,
    inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0,
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black font-mono mb-2">My Complaints</h1>
        <p className="text-gray-400">
          Track and manage your personal complaints
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-32 bg-white/5 rounded-lg" />}>
        <DashboardStats stats={stats} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse h-64 bg-white/5 rounded-lg mt-8" />}>
        <ComplaintsList complaints={complaints || []} mode="personal" />
      </Suspense>
    </main>
  )
}
