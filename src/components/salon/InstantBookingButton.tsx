'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

interface Props {
  salonId: string
}

export default function InstantBookingButton({ salonId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [noSlot, setNoSlot] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    setNoSlot(false)
    try {
      const res = await fetch(`/api/salons/${salonId}/next-slot`)
      const j = await res.json()

      if (!res.ok || !j.data) {
        setNoSlot(true)
        return
      }

      const slot = j.data
      const date = slot.date
      router.push(`/book/${salonId}?instant=true&staff_id=${slot.staff_id}&date=${date}`)
    } catch {
      setNoSlot(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors shadow-sm active:scale-[0.98]"
      >
        <Zap className="w-5 h-5 fill-white" />
        {loading ? 'Finding next slot…' : '⚡ Book Next Available'}
      </button>
      {noSlot && (
        <p className="text-center text-slate-400 text-sm mt-2">
          No available slots right now. Try booking manually below.
        </p>
      )}
    </div>
  )
}
