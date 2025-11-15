export const metadata = {
  title: "Admin Dashboard – BrotoRaise",
  description: "Manage and respond to student complaints across all Brocamp locations.",
};

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminStats } from '@/components/admin/admin-stats'
import { AdminComplaintsList } from '@/components/admin/admin-complaints-list'
import { BroBotChat } from '@/components/brobot/brobot-chat'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'

export default async function AdminPage() {
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
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <AdminHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">
              Manage and respond to student complaints
            </p>
          </div>

          <AdminStats stats={stats} />

          <AdminComplaintsList complaints={complaints || []} />
        </main>

        <BroBotChat
          userAvatarUrl={profile?.avatar_url}
          userRole={profile?.role}
          userName={profile?.full_name}
          currentPage="admin-dashboard"
          userStats={stats}
        />
        <MobileBottomNav role="admin" />
      </div>
    </div>
  )
}
