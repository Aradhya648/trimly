'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import BookingCard from '@/components/booking/BookingCard'
import ReviewModal from '@/components/booking/ReviewModal'
import type { BookingWithDetails } from '@/types'

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/bookings/my')
      .then((r) => {
        if (r.status === 401) {
          router.push('/auth/login?redirectTo=/bookings')
          return null
        }
        return r.json()
      })
      .then((j) => {
        if (j) setBookings(j.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleReviewSubmit = () => {
    if (reviewBookingId) {
      setReviewedIds((prev) => new Set([...prev, reviewBookingId]))
    }
    setReviewBookingId(null)
  }

  const completedWithoutReview = (booking: BookingWithDetails) =>
    booking.status === 'completed' && !booking.review && !reviewedIds.has(booking.id)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-slate-400 text-lg font-medium">No bookings yet</p>
            <p className="text-slate-500 text-sm mt-1">Browse salons to book your first appointment</p>
            <button
              onClick={() => router.push('/salons')}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm underline"
            >
              Browse salons
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <div key={booking.id}>
                <BookingCard booking={booking} />
                {completedWithoutReview(booking) && (
                  <div className="mt-1 px-1">
                    <button
                      onClick={() => setReviewBookingId(booking.id)}
                      className="text-xs font-semibold text-amber-400 border border-amber-400/50 hover:bg-amber-400/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ⭐ Rate your visit
                    </button>
                  </div>
                )}
                {reviewedIds.has(booking.id) && (
                  <div className="mt-1 px-1">
                    <span className="text-xs text-emerald-400 font-medium">Review submitted!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          onClose={() => setReviewBookingId(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
