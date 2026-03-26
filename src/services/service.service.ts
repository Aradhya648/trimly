import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types'
import type { CreateServiceInput } from '@/lib/validations'

export async function getServicesBySalon(salonId: string): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createService(
  salonId: string,
  input: CreateServiceInput
): Promise<Service> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .insert({ ...input, salon_id: salonId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateService(
  serviceId: string,
  updates: Partial<CreateServiceInput>
): Promise<Service> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', serviceId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteService(serviceId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', serviceId)

  if (error) throw new Error(error.message)
}
