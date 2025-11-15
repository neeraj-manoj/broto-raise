import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'

// Lazy load AnalyticsDashboard (contains recharts - heavy component)
const AnalyticsDashboard = dynamic(() => import('@/components/admin/analytics-dashboard').then(mod => ({ default: mod.AnalyticsDashboard })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-gray-400">Loading analytics...</div>
    </div>
  ),
});

export default async function AnalyticsPage() {
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

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Fetch all complaints
  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  // Map location data to complaints if they exist
  if (complaints && complaints.length > 0 && locations) {
    complaints.forEach((complaint: any) => {
      complaint.location = locations.find(l => l.id === complaint.location_id)
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <AdminHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
          <AnalyticsDashboard
            complaints={complaints || []}
            locations={locations || []}
          />
        </main>

        <MobileBottomNav role={profile?.role === 'super_admin' ? 'super_admin' : 'admin'} />
      </div>
    </div>
  )
}
