'use client'

import { useEffect, useState } from 'react'
import type { BarberStatusType } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Props {
  staffId: string
  initialStatus: BarberStatusType
  initialQueue: number
}

const STATUS_DOT: Record<BarberStatusType, string> = {
  available: 'bg-green-500',
  busy: 'bg-amber-400',
  break: 'bg-red-500',
  offline: 'bg-gray-400',
}

const STATUS_LABEL: Record<BarberStatusType, string> = {
  available: 'Available',
  busy: 'Busy',
  break: 'On break',
  offline: 'Offline',
}

export default function LiveTrafficBadge({ staffId, initialStatus, initialQueue }: Props) {
  const [status, setStatus] = useState<BarberStatusType>(initialStatus)
  const [queueLen, setQueueLen] = useState(initialQueue)

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let cancelled = false

    import('@/lib/supabase/client').then(({ createClient }) => {
      if (cancelled) return
      const supabase = createClient()
      channel = supabase
        .channel(`barber_status:${staffId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'barber_status',
            filter: `staff_id=eq.${staffId}`,
          },
          (payload) => {
            const row = payload.new as { status: BarberStatusType; queue_len: number }
            if (row) {
              setStatus(row.status)
              setQueueLen(row.queue_len)
            }
          }
        )
        .subscribe()
    })

    return () => {
      cancelled = true
      channel?.unsubscribe()
    }
  }, [staffId])

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
      <span className="text-xs text-slate-400">{STATUS_LABEL[status]}</span>
      {queueLen > 0 && (
        <span className="text-xs bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
          Queue: {queueLen} waiting
        </span>
      )}
    </div>
  )
}
