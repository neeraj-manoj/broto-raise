import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { ProfileForm } from '@/components/profile/profile-form'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'

export default async function AdminProfilePage() {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <AdminHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Profile Settings</h1>
            <p className="text-gray-400">
              Manage your admin account information
            </p>
          </div>

          <ProfileForm user={user} profile={profile} />
        </main>

        <MobileBottomNav role="admin" />
      </div>
    </div>
  )
}
