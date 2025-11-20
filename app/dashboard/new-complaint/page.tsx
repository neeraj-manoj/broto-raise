import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ComplaintForm } from '@/components/complaints/complaint-form'

export default async function NewComplaintPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('location_id')
    .eq('id', user.id)
    .single()

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
      <ComplaintForm userId={user.id} userLocation={profile?.location_id} />
    </main>
  )
}
