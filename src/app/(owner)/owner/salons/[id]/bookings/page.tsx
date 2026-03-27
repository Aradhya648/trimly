'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import BookingsTable from '@/components/owner/BookingsTable'
import { Button } from '@/components/ui/button'
import type { BookingWithDetails } from '@/types'

export default function OwnerSalonBookingsPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/owner/salons/${salonId}/bookings`)
      .then((r) => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setBookings(j.data ?? [])
        setLoading(false)
      })
  }, [salonId])

  const handleComplete = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    })
    if (!res.ok) { toast.error('Failed to mark as completed'); return }
    toast.success('Booking marked as completed')
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' as const } : b))
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/owner/salons">
            <Button variant="ghost" size="sm" className="text-slate-400">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex-1">Bookings</h1>
          <div className="flex gap-2">
            <Link href={`/owner/salons/${salonId}/services`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Services</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/staff`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Staff</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/availability`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Availability</Button>
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          {loading ? (
            <div className="h-40 animate-pulse bg-slate-800 rounded-xl" />
          ) : bookings.length === 0 ? (
            <p className="text-center text-slate-400 py-12">No bookings yet</p>
          ) : (
            <BookingsTable bookings={bookings} onComplete={handleComplete} />
          )}
        </div>
      </main>
    </div>
  )
}
