'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import SalonGrid from '@/components/salon/SalonGrid'
import type { Salon } from '@/types'

const FILTER_CHIPS = ['All', 'Nearby', 'Rating 4+', 'Offers', 'Under ₹300']
const CITIES = ['Lucknow', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata']

function SalonListing() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [area, setArea] = useState(searchParams.get('area') ?? '')
  const [activeChip, setActiveChip] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const fetchSalons = async (s: string, c: string, a: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (s) params.set('search', s)
    if (c) params.set('city', c)
    if (a) params.set('area', a)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    if (lat) params.set('lat', lat)
    if (lng) params.set('lng', lng)

    const res = await fetch(`/api/salons?${params.toString()}`)
    const json = await res.json()
    setSalons(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSalons(search, city, area)
  }, [])

  const handleSearch = () => fetchSalons(search, city, area)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white sticky top-16 z-10 px-4 py-3 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search salons, services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-amber-400 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5 pb-0.5">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeChip === chip
                  ? 'bg-amber-400 text-white border-amber-400'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Advanced Filters (expandable) */}
        {showFilters && (
          <div className="flex gap-2 mt-2.5 flex-wrap">
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); fetchSalons(search, e.target.value, area) }}
              className="bg-gray-100 border-0 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Area / Locality"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-gray-100 border-0 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-400 w-36"
            />
            <button
              onClick={handleSearch}
              className="bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Result count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4 font-medium">
            {salons.length} salon{salons.length !== 1 ? 's' : ''} found
            {city ? ` in ${city}` : ''}
            {area ? `, ${area}` : ''}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <SalonGrid salons={salons} />
        )}
      </main>
    </div>
  )
}

export default function SalonsPage() {
  return (
    <Suspense>
      <SalonListing />
    </Suspense>
  )
}
