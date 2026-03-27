'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import SlotManager from '@/components/owner/SlotManager'
import { Button } from '@/components/ui/button'
import type { Staff, AvailabilitySlot } from '@/types'

export default function OwnerAvailabilityPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/owner/salons/${salonId}/staff`)
      .then((r) => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setStaff(j.data ?? [])
        setLoading(false)
      })
  }, [salonId])

  useEffect(() => {
    if (!date) return
    fetch(`/api/owner/salons/${salonId}/availability?date=${date}`)
      .then((r) => r.json())
      .then((j) => setSlots(j.data ?? []))
  }, [salonId, date])

  const handleAddSlot = async (staffId: string, startTime: string, endTime: string) => {
    const res = await fetch(`/api/owner/salons/${salonId}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: staffId, date, start_time: startTime, end_time: endTime }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to add slot')
    toast.success('Slot added!')
    setSlots((prev) => [...prev, json.data])
  }

  const handleDeleteSlot = async (slotId: string) => {
    const res = await fetch(`/api/owner/salons/${salonId}/availability?slot_id=${slotId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete slot'); return }
    toast.success('Slot deleted')
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/owner/salons">
            <Button variant="ghost" size="sm" className="text-slate-400">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex-1">Availability</h1>
          <div className="flex gap-2">
            <Link href={`/owner/salons/${salonId}/services`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Services</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/staff`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Staff</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/bookings`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Bookings</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl h-64 animate-pulse" />
        ) : staff.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">Add staff members first before managing availability.</p>
            <Link href={`/owner/salons/${salonId}/staff`}>
              <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">Go to Staff</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <SlotManager
              staff={staff}
              slots={slots}
              date={date}
              onDateChange={setDate}
              onAddSlot={handleAddSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          </div>
        )}
      </main>
    </div>
  )
}
