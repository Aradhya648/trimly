'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import BookingsTable from '@/components/owner/BookingsTable'
import type { BookingWithDetails } from '@/types'

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => {
        if (r.status === 401 || r.status === 403) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setBookings(j.data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <span className="text-slate-400 text-sm">{bookings.length} total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          {loading ? (
            <div className="h-40 animate-pulse bg-slate-800 rounded-xl" />
          ) : bookings.length === 0 ? (
            <p className="text-center text-slate-400 py-12">No bookings yet</p>
          ) : (
            <BookingsTable bookings={bookings} />
          )}
        </div>
      </main>
    </div>
  )
}
