import { NextRequest, NextResponse } from 'next/server'
import { getSalonById } from '@/services/salon.service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const salon = await getSalonById(id)
    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }
    return NextResponse.json({ data: salon })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch salon' },
      { status: 500 }
    )
  }
}
