'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { toast } from 'sonner'

export default function RolePage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<'customer' | 'owner' | null>(null)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          if (data.user) {
            const name =
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              null
            setUserName(name)
          }
        })
    })
  }, [])

  const handleSelect = async (role: 'customer' | 'owner') => {
    setSelected(role)
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          full_name: userName || 'Trimly User',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')
      toast.success(role === 'owner' ? 'Welcome, salon owner!' : 'Welcome to Trimly!')
      router.push(role === 'owner' ? '/onboarding' : '/')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
      setSaving(false)
      setSelected(null)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-md">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">Trimly</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        {userName && (
          <p className="text-amber-500 font-semibold text-sm mb-1">
            Hey, {userName}!
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Trimly</h1>
        <p className="text-gray-400 text-sm mt-1">How will you use Trimly?</p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {/* Customer */}
        <button
          onClick={() => !saving && handleSelect('customer')}
          disabled={saving}
          className={`flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 rounded-2xl shadow-sm p-8 transition-all
            ${selected === 'customer'
              ? 'border-amber-400 bg-amber-50 shadow-amber-100'
              : 'border-gray-100 hover:border-amber-300 hover:bg-amber-50/40'}
            ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="I am a customer"
        >
          <span className="text-4xl" role="img" aria-label="customer">🧑</span>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-base">I'm a Customer</p>
            <p className="text-gray-400 text-xs mt-0.5">Browse salons, book appointments</p>
          </div>
          {selected === 'customer' && saving && (
            <span className="text-xs text-amber-500 font-medium">Saving...</span>
          )}
        </button>

        {/* Owner */}
        <button
          onClick={() => !saving && handleSelect('owner')}
          disabled={saving}
          className={`flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 rounded-2xl shadow-sm p-8 transition-all
            ${selected === 'owner'
              ? 'border-amber-400 bg-amber-50 shadow-amber-100'
              : 'border-gray-100 hover:border-amber-300 hover:bg-amber-50/40'}
            ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="I own a salon"
        >
          <span className="text-4xl" role="img" aria-label="salon owner">💈</span>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-base">I own a Salon</p>
            <p className="text-gray-400 text-xs mt-0.5">List your salon, manage bookings</p>
          </div>
          {selected === 'owner' && saving && (
            <span className="text-xs text-amber-500 font-medium">Saving...</span>
          )}
        </button>
      </div>
    </main>
  )
}
