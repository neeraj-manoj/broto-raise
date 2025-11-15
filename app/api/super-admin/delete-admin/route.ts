import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication and verify super_admin role
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 })
    }

    // Get userId from request
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check the user being deleted is not a super_admin
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single()

    if (targetProfile?.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete Super Admin accounts. Backend access required.' },
        { status: 403 }
      )
    }

    // Use admin client with service role for deletion
    const adminClient = createServerSupabaseAdminClient()

    // Delete the auth user using admin API first
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      throw new Error(`Failed to delete user: ${authError.message}`)
    }

    // Then delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `Admin ${targetProfile?.full_name} deleted successfully`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
