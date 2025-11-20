import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminSettingsPage() {
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-black font-mono">Admin Settings</h1>
          <Button
            asChild
            variant="outline"
            className="hidden lg:flex border-white/20 text-white hover:bg-white/10"
          >
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <p className="text-gray-400">
          Manage your admin account settings and preferences
        </p>
      </div>

      <SettingsForm user={user} profile={profile} isAdmin />
    </main>
  )
}
