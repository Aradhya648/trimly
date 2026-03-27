'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import SalonGrid from '@/components/salon/SalonGrid'
import type { Salon } from '@/types'

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']

function SalonListing() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [area, setArea] = useState(searchParams.get('area') ?? '')

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

  const handleSearch = () => {
    fetchSalons(search, city, area)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Browse Salons</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search salons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input
            placeholder="Area / Locality"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 w-40"
          />
          <Button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <SalonGrid salons={salons} />
        )}
      </main>
      <Footer />
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
