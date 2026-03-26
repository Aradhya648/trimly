import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllSlotsByStaff, createSlot, createBulkSlots, deleteSlot } from '@/services/availability.service'
import { createSlotSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _salonId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')
    const date = searchParams.get('date')

    if (!staffId || !date) {
      return NextResponse.json({ error: 'staff_id and date are required' }, { status: 400 })
    }

    const slots = await getAllSlotsByStaff(staffId, date)
    return NextResponse.json({ data: slots })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch slots' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _salonId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    // Support bulk creation
    if (Array.isArray(body)) {
      const parsed = z.array(createSlotSchema).safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
      }
      const slots = await createBulkSlots(parsed.data)
      return NextResponse.json({ data: slots }, { status: 201 })
    }

    const parsed = createSlotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const slot = await createSlot(parsed.data)
    return NextResponse.json({ data: slot }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create slot' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slot_id')
    if (!slotId) return NextResponse.json({ error: 'slot_id required' }, { status: 400 })

    await deleteSlot(slotId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete slot' },
      { status: 500 }
    )
  }
}
