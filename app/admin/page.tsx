export const metadata = {
  title: "Admin Dashboard – BrotoRaise",
  description: "Manage and respond to student complaints across all Brocamp locations.",
};

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminStats } from '@/components/admin/admin-stats'
import { AdminComplaintsList } from '@/components/admin/admin-complaints-list'
import { Suspense } from 'react'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication (cached)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get all complaints first (without joins to debug)
  const { data: complaints, error: complaintsError, count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Fetch student and location data separately if complaints exist
  if (complaints && complaints.length > 0) {
    // Get unique student IDs and location IDs
    const studentIds = [...new Set(complaints.map(c => c.student_id).filter(Boolean))]
    const locationIds = [...new Set(complaints.map(c => c.location_id).filter(Boolean))]

    // Fetch students
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', studentIds)

    // Fetch locations
    const { data: locations } = await supabase
      .from('locations')
      .select('id, name, city')
      .in('id', locationIds)

    // Map students and locations to complaints
    complaints.forEach((complaint: any) => {
      complaint.student = students?.find(s => s.id === complaint.student_id)
      complaint.location = locations?.find(l => l.id === complaint.location_id)
    })
  }

  // Calculate comprehensive stats
  const resolvedComplaints = complaints?.filter(c =>
    (c.status === 'resolved' || c.status === 'closed') && c.resolved_at
  ) || []

  const avgResolutionTime = resolvedComplaints.length > 0
    ? resolvedComplaints.reduce((sum, c) => {
        const hours = Math.abs(new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0) / resolvedComplaints.length
    : 0

  const stats = {
    total: count || 0,
    pending: complaints?.filter(c => c.status === 'new' || c.status === 'under_review').length || 0,
    inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0,
    urgent: complaints?.filter(c => c.priority === 'urgent' || c.status === 'urgent').length || 0,
    activeUrgent: complaints?.filter(c =>
      (c.priority === 'urgent' || c.status === 'urgent') &&
      c.status !== 'resolved' &&
      c.status !== 'closed'
    ).length || 0,
    avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1)),
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black font-mono mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">
          Manage and respond to student complaints
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-32 bg-white/5 rounded-lg" />}>
        <AdminStats stats={stats} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse h-64 bg-white/5 rounded-lg mt-8" />}>
        <AdminComplaintsList complaints={complaints || []} />
      </Suspense>
    </main>
  )
}
