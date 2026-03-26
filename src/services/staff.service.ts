import { createClient } from '@/lib/supabase/server'
import type { Staff } from '@/types'
import type { CreateStaffInput } from '@/lib/validations'

export async function getStaffBySalon(salonId: string): Promise<Staff[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_services(service_id)')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createStaff(
  salonId: string,
  input: CreateStaffInput
): Promise<Staff> {
  const supabase = await createClient()
  const { service_ids, ...staffData } = input

  const { data, error } = await supabase
    .from('staff')
    .insert({ ...staffData, salon_id: salonId })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (service_ids && service_ids.length > 0) {
    await supabase.from('staff_services').insert(
      service_ids.map((sid) => ({ staff_id: data.id, service_id: sid }))
    )
  }

  return data
}

export async function updateStaff(
  staffId: string,
  updates: Partial<CreateStaffInput>
): Promise<Staff> {
  const supabase = await createClient()
  const { service_ids, ...staffData } = updates

  const { data, error } = await supabase
    .from('staff')
    .update(staffData)
    .eq('id', staffId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (service_ids !== undefined) {
    await supabase.from('staff_services').delete().eq('staff_id', staffId)
    if (service_ids.length > 0) {
      await supabase.from('staff_services').insert(
        service_ids.map((sid) => ({ staff_id: staffId, service_id: sid }))
      )
    }
  }

  return data
}

export async function deleteStaff(staffId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('staff')
    .update({ is_active: false })
    .eq('id', staffId)

  if (error) throw new Error(error.message)
}
