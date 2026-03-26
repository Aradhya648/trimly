import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/services/availability.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: salonId } = await params
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')
    const date = searchParams.get('date')

    if (!staffId || !date) {
      return NextResponse.json(
        { error: 'staff_id and date are required' },
        { status: 400 }
      )
    }

    const slots = await getAvailableSlots(salonId, staffId, date)
    return NextResponse.json({ data: slots })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch slots' },
      { status: 500 }
    )
  }
}
