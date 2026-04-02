import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyOtpSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = verifyOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, token } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if this is a new user (no full_name set yet)
    const userId = data.user?.id
    let isNew = false
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()
      isNew = !profile?.full_name
    }

    return NextResponse.json({ user: data.user, session: data.session, isNew })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
