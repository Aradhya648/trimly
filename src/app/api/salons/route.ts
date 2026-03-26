import { NextRequest, NextResponse } from 'next/server'
import { getSalons } from '@/services/salon.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || undefined
    const area = searchParams.get('area') || undefined
    const search = searchParams.get('search') || undefined
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined

    const salons = await getSalons({ city, area, search, lat, lng })
    return NextResponse.json({ data: salons })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch salons' },
      { status: 500 }
    )
  }
}
