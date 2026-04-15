import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .from('offers')
      .select('*')
      .eq('salon_id', id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const owned = await verifyOwnership(id, user.id)
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { title, discount_pct, code, valid_until, description } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('offers')
      .insert({
        salon_id: id,
        title: title.trim(),
        discount_pct: discount_pct ?? null,
        code: code?.trim() || null,
        valid_from: new Date().toISOString(),
        valid_until: valid_until || null,
        description: description?.trim() || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create offer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const owned = await verifyOwnership(id, user.id)
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offer_id')
    if (!offerId) return NextResponse.json({ error: 'offer_id is required' }, { status: 400 })

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId)
      .eq('salon_id', id)

    if (error) throw new Error(error.message)
    return NextResponse.json({ data: null })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete offer' },
      { status: 500 }
    )
  }
}
