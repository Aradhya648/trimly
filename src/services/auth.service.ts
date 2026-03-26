import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'role'>>
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return data
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const profile = await getProfile(user.id)
  return { user, profile }
}

export async function requireRole(role: UserRole) {
  const current = await getCurrentUser()
  if (!current || current.profile?.role !== role) {
    throw new Error(`Unauthorized: requires ${role} role`)
  }
  return current
}
