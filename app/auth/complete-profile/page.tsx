import { CompleteProfileForm } from '@/components/auth/complete-profile-form'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquareWarning } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <MessageSquareWarning className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-black font-mono">
                <span className="bg-white text-gray-900 px-1">BRO</span>TORAISE
              </span>
            </Link>
          </div>

          <CompleteProfileForm />
        </div>
      </div>
    </div>
  )
}
