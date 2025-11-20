import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get locations for dropdown
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsForm user={user} profile={profile} locations={locations || []} />
    </main>
  )
}
