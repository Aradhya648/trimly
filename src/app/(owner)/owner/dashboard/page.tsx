'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, CalendarCheck, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import StatCard from '@/components/owner/StatCard'
import BookingsTable from '@/components/owner/BookingsTable'
import type { Salon, BookingWithDetails } from '@/types'

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const [salonsRes, ...bookingsResponses] = await Promise.all([
        fetch('/api/owner/salons'),
      ])
      if (salonsRes.status === 401) {
        router.push('/auth/login')
        return
      }
      const salonsJson = await salonsRes.json()
      const salonList: Salon[] = salonsJson.data ?? []
      setSalons(salonList)

      // Fetch bookings for all salons
      const allBookings: BookingWithDetails[] = []
      for (const salon of salonList) {
        const res = await fetch(`/api/owner/salons/${salon.id}/bookings`)
        const j = await res.json()
        if (j.data) allBookings.push(...j.data)
      }
      setBookings(allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      setLoading(false)
    }
    init()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter((b) => b.slot?.date === today && b.status === 'confirmed')
  const upcomingBookings = bookings.filter((b) => b.slot?.date >= today && b.status === 'confirmed')

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
          </div>
          <Link href="/owner/salons">
            <button className="flex items-center gap-1.5 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Manage salons <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Salons" value={salons.length} icon={<Store className="w-5 h-5" />} />
            <StatCard title="Today's Bookings" value={todayBookings.length} description="confirmed" icon={<CalendarCheck className="w-5 h-5" />} />
            <StatCard title="Upcoming" value={upcomingBookings.length} description="all upcoming confirmed" icon={<Clock className="w-5 h-5" />} />
            <StatCard title="Total Bookings" value={bookings.length} description="all time" icon={<TrendingUp className="w-5 h-5" />} />
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          {loading ? (
            <div className="h-32 animate-pulse bg-slate-800 rounded-xl" />
          ) : (
            <BookingsTable bookings={bookings.slice(0, 10)} />
          )}
        </div>
      </main>
    </div>
  )
}
