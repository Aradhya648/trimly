import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BarberStatusType } from '@/types'

type Params = { params: Promise<{ id: string }> }

// Verify the current user owns the salon
async function verifyOwnership(salonId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('salons')
    .select('id')
    .eq('id', salonId)
    .eq('owner_id', userId)
    .single()
  return !!data
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const owned = await verifyOwnership(id, user.id)
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('staff')
      .select('*, barber_status(*)')
      .eq('salon_id', id)
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error(error.message)
    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch barber status' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const owned = await verifyOwnership(id, user.id)
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { staff_id, status, queue_len } = body as {
      staff_id: string
      status: BarberStatusType
      queue_len: number
    }

    if (!staff_id || !status) {
      return NextResponse.json({ error: 'staff_id and status are required' }, { status: 400 })
    }

    const validStatuses: BarberStatusType[] = ['available', 'busy', 'break', 'offline']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Upsert into barber_status table
    const { data, error } = await supabase
      .from('barber_status')
      .upsert(
        {
          staff_id,
          status,
          queue_len: queue_len ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'staff_id' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update barber status' },
      { status: 500 }
    )
  }
}
