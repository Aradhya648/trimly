'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Scissors, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import type { Profile } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const clientRef = useRef<SupabaseClient | null>(null)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      clientRef.current = supabase

      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      fetchUser()

      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchUser())
      return () => subscription.unsubscribe()
    })
  }, [])

  const handleLogout = async () => {
    await clientRef.current?.auth.signOut()
    setProfile(null)
    router.push('/')
  }

  const dashboardHref =
    profile?.role === 'owner' ? '/owner/dashboard' :
    profile?.role === 'admin' ? '/admin/salons' : '/bookings'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Trimly</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/salons"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/salons') ? 'text-amber-500' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Browse Salons
          </Link>

          {profile ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {profile.full_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Book Now
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 shadow-lg">
          <Link href="/salons" className="text-gray-700 text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>
            Browse Salons
          </Link>
          {profile ? (
            <>
              <Link
                href={dashboardHref}
                className="text-gray-700 text-sm font-medium flex items-center gap-2 py-1"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-400 text-sm font-medium text-left flex items-center gap-2 py-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 text-sm font-medium py-1" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link href="/auth/login" className="bg-amber-400 text-white text-sm font-bold text-center py-2.5 rounded-xl" onClick={() => setMobileOpen(false)}>
                Book Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
