import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SuperAdminSettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-black font-mono mb-2">Super Admin Settings</h1>
        <p className="text-gray-400">
          Manage your super admin account settings and preferences
        </p>
      </div>

      <SettingsForm user={user} profile={profile} isAdmin />
    </main>
  )
}
