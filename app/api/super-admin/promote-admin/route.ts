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

    // Get target user's current profile
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetProfile.role === 'super_admin') {
      return NextResponse.json({ error: 'User is already a Super Admin' }, { status: 400 })
    }

    // Use admin client with service role to update the role
    const adminClient = createServerSupabaseAdminClient()

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Failed to promote user: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `${targetProfile.full_name} promoted to Super Admin successfully`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to promote admin' },
      { status: 500 }
    )
  }
}
