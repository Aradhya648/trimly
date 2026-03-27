import { createClient } from '@/lib/supabase/server'
import type { Salon, SalonWithDetails } from '@/types'
import type { CreateSalonInput } from '@/lib/validations'

export interface SalonFilters {
  city?: string
  area?: string
  search?: string
  lat?: number
  lng?: number
}

export async function getSalons(filters: SalonFilters = {}): Promise<Salon[]> {
  const supabase = await createClient()
  let query = supabase.from('salons').select('*').eq('is_active', true)

  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.area) query = query.ilike('area', `%${filters.area}%`)
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,area.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function getSalonById(id: string): Promise<SalonWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salons')
    .select(`
      *,
      services(*),
      staff(*, staff_services(service_id))
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as SalonWithDetails
}

export async function getSalonsByOwner(ownerId: string): Promise<Salon[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createSalon(
  ownerId: string,
  input: CreateSalonInput
): Promise<Salon> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salons')
    .insert({ ...input, area: input.area ?? '', owner_id: ownerId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSalon(
  salonId: string,
  ownerId: string,
  updates: Partial<CreateSalonInput>
): Promise<Salon> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salons')
    .update(updates)
    .eq('id', salonId)
    .eq('owner_id', ownerId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function toggleSalonActive(
  salonId: string,
  isActive: boolean
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('salons')
    .update({ is_active: isActive })
    .eq('id', salonId)

  if (error) throw new Error(error.message)
}

export async function getAllSalonsAdmin(): Promise<Salon[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}
