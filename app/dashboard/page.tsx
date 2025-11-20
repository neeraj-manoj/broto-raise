import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardActionCard } from '@/components/dashboard/dashboard-action-card'
import { ComplaintsList } from '@/components/dashboard/complaints-list'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile for location
  const { data: profile } = await supabase
    .from('profiles')
    .select('location_id')
    .eq('id', user.id)
    .single()

  if (!profile?.location_id) {
    // Handle case where user has no location (maybe redirect to profile setup?)
    // For now, we'll just show empty state or all public complaints?
    // Let's assume location is required.
  }

  // Get community complaints (non-anonymous, same location)
  const { data: complaints } = await supabase
    .from('complaints')
    .select(`
      *,
      profiles:created_by (
        full_name,
        avatar_url,
        batch_name
      )
    `)
    .eq('location_id', profile?.location_id)
    .eq('is_anonymous', false)
    .order('created_at', { ascending: false })

  // Get user's upvotes
  const { data: upvotes } = await supabase
    .from('complaint_upvotes')
    .select('complaint_id')
    .eq('user_id', user.id)

  const userUpvotedIds = new Set(upvotes?.map(u => u.complaint_id) || [])

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black font-mono mb-2">Community Feed</h1>
        <p className="text-gray-400">
          See what's happening in your campus
        </p>
      </div>

      <DashboardActionCard />

      <Suspense fallback={<div className="animate-pulse h-64 bg-white/5 rounded-lg mt-8" />}>
        <ComplaintsList
          complaints={complaints || []}
          mode="community"
          userUpvotedIds={Array.from(userUpvotedIds)}
          currentUserId={user.id}
        />
      </Suspense>
    </main>
  )
}
