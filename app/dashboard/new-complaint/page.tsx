import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ComplaintForm } from '@/components/complaints/complaint-form'
import { BroBotChat } from '@/components/brobot/brobot-chat'
import { StudentBottomNav } from '@/components/shared/student-bottom-nav'

export default async function NewComplaintPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        <DashboardHeader user={user} profile={profile} />

        <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-4xl">
          <ComplaintForm userId={user.id} userLocation={profile?.location_id} />
        </main>

        <BroBotChat
          userAvatarUrl={profile?.avatar_url}
          userRole={profile?.role}
          userName={profile?.full_name}
          currentPage="new-complaint"
          screenContext={{
            pageType: 'complaint-form',
            fields: ['title', 'description', 'category', 'priority', 'attachments', 'anonymous'],
            categories: ['Mentor', 'Admin', 'Academic Counsellor', 'Working Hub', 'Peer', 'Other'],
            priorities: ['Low', 'Medium', 'High', 'Urgent'],
            features: ['AI Enhancement', 'Anonymous Mode', 'File Attachments']
          }}
        />
        <StudentBottomNav />
      </div>
    </div>
  )
}
