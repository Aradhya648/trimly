'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import type { Salon } from '@/types'

export default function AdminSalonsPage() {
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/salons')
      .then((r) => {
        if (r.status === 401 || r.status === 403) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setSalons(j.data ?? [])
        setLoading(false)
      })
  }, [])

  const handleToggle = async (salon: Salon) => {
    setToggling(salon.id)
    const res = await fetch(`/api/admin/salons`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salon_id: salon.id, is_active: !salon.is_active }),
    })
    if (!res.ok) {
      toast.error('Failed to update salon')
    } else {
      setSalons((prev) => prev.map((s) => s.id === salon.id ? { ...s, is_active: !s.is_active } : s))
      toast.success(salon.is_active ? 'Salon deactivated' : 'Salon activated')
    }
    setToggling(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">All Salons</h1>
          <span className="text-slate-400 text-sm">{salons.length} total</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : salons.length === 0 ? (
          <p className="text-center text-slate-400 py-20">No salons registered yet</p>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">City</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Area</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {salons.map((salon) => (
                  <tr key={salon.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-white">{salon.name}</td>
                    <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{salon.city}</td>
                    <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{salon.area || '—'}</td>
                    <td className="px-5 py-4">
                      {salon.is_active ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling === salon.id}
                        onClick={() => handleToggle(salon)}
                        className={salon.is_active ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}
                      >
                        {toggling === salon.id ? 'Updating...' : salon.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
