import { createClient } from '@/lib/supabase/server'
import type { Booking, BookingWithDetails } from '@/types'
import type { CreateBookingInput } from '@/lib/validations'

export async function createBooking(
  customerId: string,
  input: CreateBookingInput
): Promise<Booking> {
  const supabase = await createClient()

  // Verify slot is still available
  const { data: slot } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('id', input.slot_id)
    .eq('is_booked', false)
    .single()

  if (!slot) throw new Error('Slot is no longer available')

  // Get service price for payment_amount
  const { data: service } = await supabase
    .from('services')
    .select('price')
    .eq('id', input.service_id)
    .single()

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...input,
      customer_id: customerId,
      payment_amount: service?.price ?? 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getCustomerBookings(
  customerId: string
): Promise<BookingWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      salon:salons(*),
      staff:staff(*),
      service:services(*),
      slot:availability_slots(*),
      review:reviews(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as BookingWithDetails[]) || []
}

export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      salon:salons(*),
      staff:staff(*),
      service:services(*),
      slot:availability_slots(*)
    `)
    .eq('id', bookingId)
    .single()

  if (error) return null
  return data as BookingWithDetails
}

export async function cancelBooking(
  bookingId: string,
  customerId: string
): Promise<Booking> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('customer_id', customerId)
    .eq('status', 'confirmed')
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getSalonBookings(
  salonId: string
): Promise<BookingWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      salon:salons(*),
      staff:staff(*),
      service:services(*),
      slot:availability_slots(*),
      customer:profiles(*)
    `)
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as BookingWithDetails[]) || []
}

export async function getAllBookingsAdmin(): Promise<BookingWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      salon:salons(*),
      staff:staff(*),
      service:services(*),
      slot:availability_slots(*),
      customer:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as BookingWithDetails[]) || []
}

export async function completeBooking(bookingId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', bookingId)

  if (error) throw new Error(error.message)
}
