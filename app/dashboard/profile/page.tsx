import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null // Handled by layout

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Profile Settings</h1>
        <p className="text-gray-400">
          Manage your account information
        </p>
      </div>

      <ProfileForm user={user} profile={profile} />
    </main>
  )
}
