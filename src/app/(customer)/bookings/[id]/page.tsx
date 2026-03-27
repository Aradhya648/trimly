'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Scissors, User, MapPin, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import BookingStatusBadge from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import type { BookingWithDetails } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function BookingDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push('/auth/login')
          return null
        }
        return r.json()
      })
      .then((j) => {
        if (j) setBooking(j.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to cancel')
      toast.success('Booking cancelled')
      setBooking((prev) => prev ? { ...prev, status: 'cancelled' } : null)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-slate-400">Booking not found.</p>
          <button onClick={() => router.push('/bookings')} className="text-emerald-400 text-sm mt-2 underline">
            ← Back to bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => router.push('/bookings')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to bookings
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{booking.salon.name}</h1>
            <p className="text-slate-400 text-sm mt-1">Booking #{booking.id.slice(-8).toUpperCase()}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
          <div className="grid gap-4">
            <InfoRow icon={<Scissors className="w-4 h-4 text-emerald-500" />} label="Service" value={booking.service.name} />
            <InfoRow icon={<User className="w-4 h-4 text-emerald-500" />} label="Barber" value={booking.staff.name} />
            <InfoRow icon={<Calendar className="w-4 h-4 text-emerald-500" />} label="Date" value={formatDate(booking.slot.date)} />
            <InfoRow icon={<Clock className="w-4 h-4 text-emerald-500" />} label="Time" value={`${formatTime(booking.slot.start_time)} – ${formatTime(booking.slot.end_time)}`} />
            <InfoRow icon={<MapPin className="w-4 h-4 text-emerald-500" />} label="Address" value={`${booking.salon.address}, ${booking.salon.area}, ${booking.salon.city}`} />
          </div>

          <div className="border-t border-slate-800 mt-4 pt-4 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Amount</span>
            <span className="text-emerald-400 font-bold text-xl">{formatCurrency(booking.payment_amount)}</span>
          </div>

          {booking.notes && (
            <div className="border-t border-slate-800 mt-4 pt-4">
              <p className="text-slate-400 text-sm">Notes</p>
              <p className="text-white text-sm mt-1">{booking.notes}</p>
            </div>
          )}
        </div>

        {booking.status === 'confirmed' && (
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        )}
      </main>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white font-medium text-sm">{value}</p>
      </div>
    </div>
  )
}
