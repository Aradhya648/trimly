'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    router.push(`/salons?${params.toString()}`)
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const params = new URLSearchParams({
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString(),
      })
      router.push(`/salons?${params.toString()}`)
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-bold tracking-tight">Trimly</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.push('/auth/login')} className="text-slate-300">
            Login
          </Button>
          <Button onClick={() => router.push('/auth/login')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Book Now
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Book before you leave home
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Your barber,
          <span className="text-emerald-400"> ready when</span>
          <br /> you arrive.
        </h1>

        <p className="text-slate-400 text-lg max-w-xl">
          Find top-rated barbers near you, check real availability, and book your slot in seconds. No waiting. No walk-ins.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
              placeholder="Search by salon, city, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 h-12 px-6">
            Search
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={handleNearMe}
          className="text-slate-400 hover:text-emerald-400 flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Use my location
        </Button>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 pb-24">
        {[
          { icon: '✂️', title: 'Top Barbers', desc: 'Handpicked salons with verified reviews.' },
          { icon: '📅', title: 'Real Availability', desc: 'Live slots — no more calling ahead.' },
          { icon: '⚡', title: 'Instant Booking', desc: 'Confirm your appointment in seconds.' },
        ].map((f) => (
          <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
