import dynamic from 'next/dynamic'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Lazy load AnalyticsDashboard (contains recharts - heavy component)
const AnalyticsDashboard = dynamic(() => import('@/components/admin/analytics-dashboard').then(mod => ({ default: mod.AnalyticsDashboard })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-gray-400">Loading analytics...</div>
    </div>
  ),
});

export default async function SuperAdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <AnalyticsDashboard
        complaints={complaints || []}
        locations={locations || []}
        role={profile?.role}
      />
    </main>
  )
}
