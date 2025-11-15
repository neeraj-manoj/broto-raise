import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SuperAdminHeader } from '@/components/super-admin/super-admin-header'
import { AdminManagementContent } from '@/components/super-admin/admin-management-content'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'

export default async function AdminManagementPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile and verify super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only super_admin can access this page
  if (profile?.role !== 'super_admin') {
    if (profile?.role === 'admin') {
      redirect('/admin')
    }
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <SuperAdminHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Admin Management</h1>
            <p className="text-gray-400">
              Create and manage administrator accounts
            </p>
          </div>

          <AdminManagementContent />
        </main>

        <MobileBottomNav role="super_admin" />
      </div>
    </div>
  )
}
