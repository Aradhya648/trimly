'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Scissors, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
  }

  const dashboardHref =
    profile?.role === 'owner' ? '/owner/dashboard' :
    profile?.role === 'admin' ? '/admin/salons' : '/bookings'

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-bold text-white tracking-tight">Trimly</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/salons"
            className={`text-sm ${pathname.startsWith('/salons') ? 'text-emerald-400' : 'text-slate-400 hover:text-white'} transition-colors`}
          >
            Browse Salons
          </Link>
          {profile ? (
            <>
              <Link
                href={dashboardHref}
                className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/auth/login')}
                className="text-slate-300"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/auth/login')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Book Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 flex flex-col gap-3">
          <Link href="/salons" className="text-slate-300 text-sm" onClick={() => setMobileOpen(false)}>
            Browse Salons
          </Link>
          {profile ? (
            <>
              <Link href={dashboardHref} className="text-slate-300 text-sm flex items-center gap-1" onClick={() => setMobileOpen(false)}>
                <User className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="text-slate-300 text-sm text-left flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-300 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/auth/login" className="text-emerald-400 text-sm font-medium" onClick={() => setMobileOpen(false)}>Book Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
