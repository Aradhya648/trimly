import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBooking } from '@/services/booking.service'
import { getBookingById } from '@/services/booking.service'
import { sendBookingConfirmation } from '@/services/notification.service'
import { createBookingSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const booking = await createBooking(user.id, parsed.data)
    const bookingWithDetails = await getBookingById(booking.id)

    // Send confirmation email if email is available
    if (user.email && bookingWithDetails) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      await sendBookingConfirmation(
        bookingWithDetails,
        user.email,
        profile?.full_name || 'Customer'
      ).catch(console.error) // Non-blocking
    }

    return NextResponse.json({ data: bookingWithDetails ?? booking }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    )
  }
}
