import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'

export default async function SuperAdminSettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is super admin
  if (!profile || profile.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black font-mono mb-2">Super Admin Settings</h1>
          <p className="text-gray-400">
            Manage your super admin account settings and preferences
          </p>
        </div>

        <SettingsForm user={user} profile={profile} isAdmin />
      </div>

      <MobileBottomNav role="super_admin" />
    </div>
  )
}
