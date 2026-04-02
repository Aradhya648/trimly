import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (signInError) {
      // If user doesn't exist, attempt sign up, then sign in
      const msg = signInError.message?.toLowerCase() ?? ''
      if (msg.includes('invalid login credentials') || msg.includes('user not found')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              full_name: '',
              role: 'customer', // default
            },
          },
        })
        if (signUpError) {
          return NextResponse.json({ error: signUpError.message }, { status: 400 })
        }
        // Immediately attempt sign in again
        const { data: loginAgain, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })
        if (loginError) {
          return NextResponse.json({ error: loginError.message }, { status: 400 })
        }
        return NextResponse.json({ session: loginAgain.session, user: loginAgain.user, isNew: true })
      }
      return NextResponse.json({ error: signInError.message }, { status: 400 })
    }

    return NextResponse.json({ session: signInData.session, user: signInData.user, isNew: false })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
