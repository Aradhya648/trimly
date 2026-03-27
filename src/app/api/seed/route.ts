import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SALONS = [
  {
    name: 'Scissorhands Studio',
    description: 'Premium grooming studio in the heart of Gomti Nagar. Expert barbers, modern techniques.',
    city: 'Lucknow',
    area: 'Gomti Nagar',
    address: 'Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010',
    phone: '+919876543210',
    cover_image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    services: [
      { name: 'Classic Haircut', duration_mins: 30, price: 250 },
      { name: 'Beard Trim & Shape', duration_mins: 20, price: 150 },
      { name: 'Hair + Beard Combo', duration_mins: 45, price: 350 },
      { name: 'Royal Shave', duration_mins: 30, price: 200 },
    ],
    staff: [
      { name: 'Ravi Sharma', bio: '8 years experience in modern cuts and fades' },
      { name: 'Ankur Verma', bio: 'Specialist in beard grooming and styling' },
    ],
  },
  {
    name: "The Barber's Guild",
    description: 'Classic barbershop with a modern twist. Award-winning team in Hazratganj.',
    city: 'Lucknow',
    area: 'Hazratganj',
    address: 'Near Hazratganj Market, Hazratganj, Lucknow, UP 226001',
    phone: '+919876543211',
    cover_image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    services: [
      { name: 'Scissor Cut', duration_mins: 40, price: 300 },
      { name: 'Fade & Taper', duration_mins: 45, price: 350 },
      { name: 'Full Grooming Package', duration_mins: 75, price: 600 },
      { name: 'Hair Color', duration_mins: 60, price: 500 },
    ],
    staff: [
      { name: 'Pradeep Singh', bio: 'Master barber with 12 years of experience' },
      { name: 'Vishal Gupta', bio: 'Expert in fades and contemporary styles' },
    ],
  },
  {
    name: "GentleMan's Grooming",
    description: 'Upscale men\'s salon offering personalized grooming experiences in Aliganj.',
    city: 'Lucknow',
    area: 'Aliganj',
    address: 'Sector D, Aliganj, Lucknow, UP 226024',
    phone: '+919876543212',
    cover_image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
    services: [
      { name: 'Gentleman Cut', duration_mins: 35, price: 280 },
      { name: 'Hot Towel Shave', duration_mins: 30, price: 220 },
      { name: 'De-stress Scalp Massage', duration_mins: 20, price: 180 },
      { name: 'Beard Color', duration_mins: 30, price: 300 },
    ],
    staff: [
      { name: 'Suresh Patel', bio: 'Luxury grooming specialist' },
      { name: 'Mohit Tiwari', bio: 'Expert in scalp treatments and hair care' },
    ],
  },
  {
    name: 'Studio 9 Salon',
    description: 'Trendy unisex salon known for creative cuts and premium hair treatments in Indira Nagar.',
    city: 'Lucknow',
    area: 'Indira Nagar',
    address: 'C Block, Indira Nagar, Lucknow, UP 226016',
    phone: '+919876543213',
    cover_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    services: [
      { name: 'Trendy Cut', duration_mins: 40, price: 320 },
      { name: 'Keratin Treatment', duration_mins: 120, price: 1500 },
      { name: 'Hair Spa', duration_mins: 60, price: 700 },
      { name: 'Beard Sculpting', duration_mins: 25, price: 180 },
    ],
    staff: [
      { name: 'Arjun Mehta', bio: 'Creative hair stylist trained in Mumbai' },
      { name: 'Deepak Yadav', bio: 'Hair treatment and coloring specialist' },
    ],
  },
  {
    name: 'The Clipper House',
    description: 'No-frills premium barbershop. Straight razors, clean fades, real results in Mahanagar.',
    city: 'Lucknow',
    area: 'Mahanagar',
    address: 'Mahanagar Extension, Mahanagar, Lucknow, UP 226006',
    phone: '+919876543214',
    cover_image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    services: [
      { name: 'Classic Cut', duration_mins: 30, price: 200 },
      { name: 'Skin Fade', duration_mins: 40, price: 280 },
      { name: 'Straight Razor Shave', duration_mins: 25, price: 150 },
      { name: 'Cut + Shave Combo', duration_mins: 50, price: 380 },
    ],
    staff: [
      { name: 'Ramesh Kumar', bio: 'Old-school barber, new-school cuts' },
      { name: 'Nitin Saxena', bio: 'Skin fade and precise clipper work specialist' },
    ],
  },
  {
    name: 'Royal Grooming Lounge',
    description: 'Exclusive grooming lounge in Vibhuti Khand. Walk in rough, walk out royal.',
    city: 'Lucknow',
    area: 'Vibhuti Khand',
    address: 'Vibhuti Khand, Gomti Nagar Extension, Lucknow, UP 226010',
    phone: '+919876543215',
    cover_image_url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&q=80',
    services: [
      { name: 'Royal Cut', duration_mins: 45, price: 400 },
      { name: 'Luxury Beard Package', duration_mins: 40, price: 350 },
      { name: 'Head Massage + Cut', duration_mins: 60, price: 550 },
      { name: 'Full Royal Experience', duration_mins: 90, price: 900 },
    ],
    staff: [
      { name: 'Akash Srivastava', bio: 'Premium grooming and luxury hair care expert' },
      { name: 'Manish Bajpai', bio: 'Royal beard and mustache styling specialist' },
    ],
  },
]

function generateSlots(staffId: string, salonId: string) {
  const slots = []
  const today = new Date()
  for (let day = 0; day < 14; day++) {
    const date = new Date(today)
    date.setDate(today.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    // 9 AM to 7 PM, 30-min intervals
    for (let hour = 9; hour < 19; hour++) {
      for (const min of [0, 30]) {
        const start = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
        const endMin = min + 30 >= 60 ? min + 30 - 60 : min + 30
        const endHour = min + 30 >= 60 ? hour + 1 : hour
        const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
        slots.push({ staff_id: staffId, salon_id: salonId, date: dateStr, start_time: start, end_time: end, is_booked: false })
      }
    }
  }
  return slots
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Find an owner to attach salons to. Priority:
  // 1. Existing profile with role=owner
  // 2. Any existing profile
  // 3. Any auth user → upsert profile
  let ownerId: string

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (ownerProfile) {
    ownerId = ownerProfile.id
  } else {
    const { data: anyProfile } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    if (anyProfile) {
      ownerId = anyProfile.id
      // Promote to owner so they can manage these salons
      await supabase.from('profiles').update({ role: 'owner' }).eq('id', ownerId)
    } else {
      // No users at all — list auth users and create a profile for the first one
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 10 })
      const firstUser = usersData?.users?.[0]
      if (!firstUser) {
        return NextResponse.json({
          error: 'No users exist yet. Sign up at /auth/login first, then call /api/seed again.',
        }, { status: 400 })
      }
      ownerId = firstUser.id
      await supabase.from('profiles').upsert({
        id: ownerId,
        phone: firstUser.phone ?? '',
        full_name: 'Demo Owner',
        role: 'owner',
      })
    }
  }

  const results: Record<string, unknown>[] = []

  for (const salonData of SALONS) {
    const { services, staff, ...salonFields } = salonData

    // Check if salon already exists
    const { data: existing } = await supabase
      .from('salons')
      .select('id')
      .eq('name', salonFields.name)
      .single()

    let salonId: string
    if (existing) {
      salonId = existing.id
      results.push({ salon: salonFields.name, status: 'already exists', id: salonId })
      continue
    }

    // Create salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert({ ...salonFields, owner_id: ownerId, is_active: true })
      .select()
      .single()

    if (salonError) {
      results.push({ salon: salonFields.name, error: salonError.message })
      continue
    }
    salonId = salon.id

    // Insert services
    const { data: createdServices } = await supabase
      .from('services')
      .insert(services.map((s) => ({ ...s, salon_id: salonId, is_active: true })))
      .select()

    // Insert staff + assign all services
    const serviceIds = (createdServices ?? []).map((s: { id: string }) => s.id)

    for (const staffMember of staff) {
      const { data: createdStaff } = await supabase
        .from('staff')
        .insert({ ...staffMember, salon_id: salonId, is_active: true })
        .select()
        .single()

      if (!createdStaff) continue

      // Assign all services to this staff member
      if (serviceIds.length > 0) {
        await supabase.from('staff_services').insert(
          serviceIds.map((sid: string) => ({ staff_id: createdStaff.id, service_id: sid }))
        )
      }

      // Generate 14 days of slots
      const slots = generateSlots(createdStaff.id, salonId)
      // Insert in batches of 100
      for (let i = 0; i < slots.length; i += 100) {
        await supabase.from('availability_slots').insert(slots.slice(i, i + 100))
      }
    }

    results.push({ salon: salonFields.name, status: 'created', id: salonId })
  }

  return NextResponse.json({ ok: true, results })
}
