import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ServiceList from '@/components/salon/ServiceList'
import StaffCard from '@/components/salon/StaffCard'
import LiveTrafficBadge from '@/components/salon/LiveTrafficBadge'
import FavouriteButton from '@/components/salon/FavouriteButton'
import InstantBookingButton from '@/components/salon/InstantBookingButton'
import { getSalonById } from '@/services/salon.service'
import { createClient } from '@/lib/supabase/server'
import type { BarberStatus } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SalonDetailPage({ params }: Props) {
  const { id } = await params
  const salon = await getSalonById(id)
  if (!salon) notFound()

  // Fetch barber_status for all staff in this salon
  const supabase = await createClient()
  const staffIds = salon.staff.map((s) => s.id)
  let barberStatuses: BarberStatus[] = []
  if (staffIds.length > 0) {
    const { data } = await supabase
      .from('barber_status')
      .select('*')
      .in('staff_id', staffIds)
    barberStatuses = data || []
  }

  // Map statuses by staff_id
  const statusMap = new Map<string, BarberStatus>()
  for (const bs of barberStatuses) {
    statusMap.set(bs.staff_id, bs)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-slate-900">
        {salon.cover_image_url ? (
          <Image src={salon.cover_image_url} alt={salon.name} fill className="object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700 text-8xl">✂️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 -mt-16 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{salon.name}</h1>
            {salon.description && (
              <p className="text-slate-400 mt-2 max-w-xl">{salon.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {salon.address}, {salon.area}, {salon.city}
              </span>
              {salon.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {salon.phone}
                </span>
              )}
              {salon.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  {salon.email}
                </span>
              )}
            </div>
          </div>
          <Link href={`/book/${salon.id}`} className="shrink-0">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Scissors className="w-4 h-4 mr-1" />
              Book Now
            </Button>
          </Link>
        </div>

        {/* Instant Booking CTA */}
        <InstantBookingButton salonId={salon.id} />

        <div className="grid md:grid-cols-5 gap-8 mt-8">
          {/* Services */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-semibold text-white mb-4">Services</h2>
            <ServiceList services={salon.services} />
          </div>

          {/* Staff */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Our Team</h2>
            {salon.staff.length === 0 ? (
              <p className="text-slate-500 text-sm">No staff listed yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {salon.staff.map((member) => {
                  const bs = statusMap.get(member.id)
                  const initialStatus = bs?.status ?? 'offline'
                  const initialQueue = bs?.queue_len ?? 0
                  return (
                    <div key={member.id} className="border border-slate-700 bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <StaffCard staff={member} />
                        </div>
                        <FavouriteButton staffId={member.id} />
                      </div>

                      {/* Badges row */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
                        {member.is_best_seller && (
                          <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                            ⭐ Best Seller
                          </span>
                        )}
                        <LiveTrafficBadge
                          staffId={member.id}
                          initialStatus={initialStatus}
                          initialQueue={initialQueue}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={`/book/${salon.id}`}>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-10">
              Book an Appointment
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
