import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('offers')
      .select('*, salons(name)')
      .eq('is_active', true)
      .or('valid_until.is.null,valid_until.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const offers = (data || []).map((o: Record<string, unknown> & { salons?: { name: string } | null }) => ({
      ...o,
      salon_name: o.salons ? (o.salons as { name: string }).name : null,
      salons: undefined,
    }))

    return NextResponse.json({ data: offers })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
