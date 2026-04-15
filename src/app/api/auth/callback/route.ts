import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const user = data.user

  // Check if user has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isGoogleUser = user.app_metadata?.provider === 'google'
  const hasFullName = profile?.full_name && profile.full_name.trim().length > 0
  const hasRole = profile?.role && profile.role !== 'customer'

  // Google OAuth users or missing full_name → go to role selection
  if (isGoogleUser || !hasFullName || !profile) {
    return NextResponse.redirect(new URL('/auth/role', request.url))
  }

  // Profile complete with non-default role → go home
  if (hasFullName && hasRole) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Has name but default role → still go to role selection so they can confirm
  return NextResponse.redirect(new URL('/auth/role', request.url))
}
