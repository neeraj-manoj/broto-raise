import { CompleteProfileForm } from '@/components/auth/complete-profile-form'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CompleteProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if profile is already complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('location_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.location_id) {
    if (profile.role === 'super_admin') {
      redirect('/super-admin')
    } else if (profile.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <CompleteProfileForm />
    </div>
  )
}
