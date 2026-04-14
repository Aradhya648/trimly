import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBookingById, cancelBooking, completeBooking } from '@/services/booking.service'
import { sendBookingCancellation } from '@/services/notification.service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only the customer or the salon owner can view this booking
    const isCustomer = booking.customer_id === user.id
    const { data: ownedSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('id', booking.salon_id)
      .eq('owner_id', user.id)
      .single()

    if (!isCustomer && !ownedSalon) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: booking })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'cancel') {
      // Customers cancel their own bookings
      const booking = await cancelBooking(id, user.id)
      const bookingWithDetails = await getBookingById(booking.id)

      if (user.email && bookingWithDetails) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        await sendBookingCancellation(
          bookingWithDetails,
          user.email,
          profile?.full_name || 'Customer'
        ).catch(console.error)
      }

      return NextResponse.json({ data: booking })
    }

    if (action === 'complete') {
      // Only the salon owner can mark a booking as complete
      const booking = await getBookingById(id)
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      const { data: ownedSalon } = await supabase
        .from('salons')
        .select('id')
        .eq('id', booking.salon_id)
        .eq('owner_id', user.id)
        .single()

      if (!ownedSalon) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await completeBooking(id)
      return NextResponse.json({ data: { id, status: 'completed' } })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update booking' },
      { status: 500 }
    )
  }
}
