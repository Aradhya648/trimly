import { createClient } from '@/lib/supabase/server'
import type { AvailabilitySlot } from '@/types'
import type { CreateSlotInput } from '@/lib/validations'

export async function getAvailableSlots(
  salonId: string,
  staffId: string,
  date: string
): Promise<AvailabilitySlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('salon_id', salonId)
    .eq('staff_id', staffId)
    .eq('date', date)
    .eq('is_booked', false)
    .order('start_time')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getAllSlotsByStaff(
  staffId: string,
  date: string
): Promise<AvailabilitySlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('staff_id', staffId)
    .eq('date', date)
    .order('start_time')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createSlot(input: CreateSlotInput): Promise<AvailabilitySlot> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availability_slots')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createBulkSlots(
  inputs: CreateSlotInput[]
): Promise<AvailabilitySlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availability_slots')
    .insert(inputs)
    .select()

  if (error) throw new Error(error.message)
  return data || []
}

export async function deleteSlot(slotId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', slotId)
    .eq('is_booked', false)

  if (error) throw new Error(error.message)
}
