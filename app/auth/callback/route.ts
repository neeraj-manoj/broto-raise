import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createServerSupabaseClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user to check their role
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Log user metadata to debug avatar issue
        console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2))
        console.log('Avatar URL:', user.user_metadata?.avatar_url)
        
        // Check if profile exists, if not create one
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, avatar_url')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Create profile for new OAuth user
          // Try multiple possible avatar field names from GitHub
          const avatarUrl = user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture || 
                           user.user_metadata?.avatar ||
                           null
          
          console.log('Saving avatar URL:', avatarUrl)
          
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 'User',
              role: 'student',
              avatar_url: avatarUrl
            })

          // Redirect to student dashboard for new users
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          // Update avatar if it's not set and GitHub provides one
          const avatarUrl = user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture || 
                           user.user_metadata?.avatar ||
                           null
          
          if (!profile.avatar_url && avatarUrl) {
            await supabase
              .from('profiles')
              .update({ avatar_url: avatarUrl })
              .eq('id', user.id)
          }
        }

        // Redirect based on existing role
        if (profile.role === 'super_admin') {
          return NextResponse.redirect(`${origin}/super-admin`)
        } else if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        } else {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
