'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Zap, Tag, MapPin, ChevronRight, User } from 'lucide-react'
import SalonCard from '@/components/salon/SalonCard'
import type { Salon, Profile } from '@/types'

const SERVICE_CATEGORIES = [
  { label: 'Haircut', icon: '✂️', search: 'haircut' },
  { label: 'Shave', icon: '🪒', search: 'shave' },
  { label: 'Nails', icon: '💅', search: 'nails' },
  { label: 'Spa', icon: '🪷', search: 'spa' },
  { label: 'Beard', icon: '🧔', search: 'beard' },
  { label: 'Color', icon: '🎨', search: 'color' },
  { label: 'Facial', icon: '🧖', search: 'facial' },
  { label: 'More', icon: '⋯', search: '' },
]

const FILTER_CHIPS = ['Sort ↓', 'Rating 4+', 'Offers', 'Filters']

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Sort ↓')

  useEffect(() => {
    // Dynamic import so Supabase only loads client-side (prevents SSR module eval of localStorage)
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
        if (!user) return
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }: { data: Profile | null }) => setProfile(data))
      })
    })

    fetch('/api/salons?limit=10')
      .then(r => r.json())
      .then(j => { setSalons(j.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/salons${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`)
  }

  const firstName = profile?.full_name?.split(' ')[0] || null
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Sticky Top Bar */}
      <div className="bg-white px-4 pt-12 pb-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
              {firstName ? (
                <span className="text-white font-bold text-base">{firstName[0].toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {firstName ? `Hello ${firstName} 👋` : 'Welcome to Trimly'}
              </p>
              <p className="text-gray-400 text-xs">{greeting}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(profile ? '/bookings' : '/auth/login')}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 transition"
            placeholder="Search salons, services, areas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Offers Banner + Instant Booking */}
        <div className="flex gap-3">
          {/* Offers */}
          <div className="flex-1 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="w-3 h-3 text-white opacity-90" />
              <span className="text-white text-xs font-medium opacity-90">Limited Time</span>
            </div>
            <p className="font-bold text-white text-sm leading-snug">Special Offers,</p>
            <p className="font-bold text-white text-sm leading-snug">Discounts & Coupons</p>
            <p className="text-white/70 text-xs mt-1">Happy Hours • Deals</p>
            <button
              onClick={() => router.push('/salons?offers=true')}
              className="mt-3 text-xs font-semibold bg-white/25 hover:bg-white/35 text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              View All →
            </button>
          </div>

          {/* Instant Booking */}
          <button
            onClick={() => router.push('/salons')}
            className="w-[90px] bg-white border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-amber-50 hover:border-amber-400 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 text-center leading-tight px-1">
              Instant<br />Booking
            </span>
          </button>
        </div>

        {/* Service Categories */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Services</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {SERVICE_CATEGORIES.map(({ label, icon, search: s }) => (
              <button
                key={label}
                onClick={() => router.push(s ? `/salons?search=${s}` : '/salons')}
                className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 px-1 shadow-sm hover:shadow-md hover:scale-[1.04] active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
                  {icon}
                </div>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                activeFilter === chip
                  ? 'bg-amber-400 text-white border-amber-400 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Nearby Salons */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Nearby Salons</h2>
            <button
              onClick={() => router.push('/salons')}
              className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold hover:text-amber-600"
            >
              <MapPin className="w-3 h-3" />
              See all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-52 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : salons.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="text-4xl mb-3">✂️</div>
              <p className="font-semibold text-gray-700 mb-1">No salons yet</p>
              <p className="text-gray-400 text-sm">Be the first to list your salon!</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                List Your Salon
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {salons.map(salon => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
