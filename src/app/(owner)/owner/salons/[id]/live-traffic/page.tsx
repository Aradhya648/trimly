'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Users } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import type { Staff, BarberStatusType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BarberStatusLocal {
  staff_id: string
  status: BarberStatusType
  queue_len: number
  updated_at: string
}

interface StaffWithStatus extends Omit<Staff, 'barber_status'> {
  barber_status?: BarberStatusLocal | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BarberStatusType, { label: string; color: string; dot: string; bg: string }> = {
  available: { label: 'Available', color: 'text-green-700', dot: 'bg-green-500', bg: 'bg-green-50 border-green-200 ring-green-200' },
  busy:      { label: 'Busy',      color: 'text-yellow-700', dot: 'bg-yellow-400', bg: 'bg-yellow-50 border-yellow-200 ring-yellow-200' },
  break:     { label: 'Break',     color: 'text-orange-700', dot: 'bg-orange-400', bg: 'bg-orange-50 border-orange-200 ring-orange-200' },
  offline:   { label: 'Offline',   color: 'text-gray-500', dot: 'bg-gray-400', bg: 'bg-gray-50 border-gray-200 ring-gray-200' },
}

const STATUSES: BarberStatusType[] = ['available', 'busy', 'break', 'offline']

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Barber Card ─────────────────────────────────────────────────────────────
function BarberCard({
  member,
  onStatusChange,
  onQueueChange,
}: {
  member: StaffWithStatus
  onStatusChange: (staffId: string, status: BarberStatusType) => void
  onQueueChange: (staffId: string, queueLen: number) => void
}) {
  const currentStatus: BarberStatusType = member.barber_status?.status ?? 'offline'
  const queueLen = member.barber_status?.queue_len ?? 0
  const cfg = STATUS_CONFIG[currentStatus]

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 transition-all ${cfg.bg}`}>
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base shrink-0">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatar_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              getInitials(member.name)
            )}
          </div>
          {/* Status dot */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm truncate">{member.name}</h3>
            {member.is_best_seller && (
              <span className="text-amber-500 text-xs font-semibold">⭐ Best Seller</span>
            )}
          </div>
          {member.specialty && (
            <p className="text-gray-500 text-xs truncate">{member.specialty}</p>
          )}
        </div>
      </div>

      {/* Status buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {STATUSES.map((s) => {
          const c = STATUS_CONFIG[s]
          const active = s === currentStatus
          return (
            <button
              key={s}
              onClick={() => onStatusChange(member.id, s)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                active
                  ? `${c.bg} ${c.color} border-current ring-1 ${c.bg}`
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${active ? c.dot : 'bg-gray-300'}`} />
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Queue length */}
      <div>
        <p className="text-gray-500 text-xs mb-1.5 flex items-center gap-1">
          <Users className="w-3 h-3" /> Queue waiting
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onQueueChange(member.id, n)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                n === queueLen
                  ? 'bg-amber-400 text-white ring-2 ring-amber-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LiveTrafficPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [staffList, setStaffList] = useState<StaffWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [salonName, setSalonName] = useState('Salon')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/owner/salons/${salonId}/barber-status`)
    if (res.status === 401) { router.push('/auth/login'); return }
    const json = await res.json()
    if (json.data) {
      setStaffList(json.data)
      setLastRefresh(new Date())
    }
    setLoading(false)
  }, [salonId, router])

  // Also load the salon name
  useEffect(() => {
    fetch('/api/owner/salons')
      .then((r) => r.json())
      .then((j) => {
        const salon = (j.data ?? []).find((s: { id: string; name: string }) => s.id === salonId)
        if (salon) setSalonName(salon.name)
      })
  }, [salonId])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData])

  // ── Optimistic status update ──
  const handleStatusChange = async (staffId: string, status: BarberStatusType) => {
    const prev = staffList
    setStaffList((list) =>
      list.map((m) =>
        m.id === staffId
          ? {
              ...m,
              barber_status: {
                staff_id: staffId,
                status,
                queue_len: m.barber_status?.queue_len ?? 0,
                updated_at: new Date().toISOString(),
              },
            }
          : m
      )
    )
    try {
      const res = await fetch(`/api/owner/salons/${salonId}/barber-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          status,
          queue_len: prev.find((m) => m.id === staffId)?.barber_status?.queue_len ?? 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`Status updated to ${status}`)
    } catch {
      setStaffList(prev)
      toast.error('Failed to update status')
    }
  }

  // ── Optimistic queue update ──
  const handleQueueChange = async (staffId: string, queueLen: number) => {
    const prev = staffList
    setStaffList((list) =>
      list.map((m) =>
        m.id === staffId
          ? {
              ...m,
              barber_status: {
                staff_id: staffId,
                status: m.barber_status?.status ?? 'offline',
                queue_len: queueLen,
                updated_at: new Date().toISOString(),
              },
            }
          : m
      )
    )
    try {
      const res = await fetch(`/api/owner/salons/${salonId}/barber-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          status: prev.find((m) => m.id === staffId)?.barber_status?.status ?? 'offline',
          queue_len: queueLen,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
    } catch {
      setStaffList(prev)
      toast.error('Failed to update queue')
    }
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/owner/salons">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Traffic</h1>
              <p className="text-gray-500 text-sm">{salonName}</p>
            </div>
          </div>

          <button
            onClick={() => { setLoading(true); fetchData() }}
            className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium mt-1"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Last refreshed */}
        <p className="text-gray-400 text-xs mb-4">
          Last updated: {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-amber-100" />
            ))}
          </div>
        ) : staffList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-sm">
            <Users className="w-10 h-10 text-amber-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No staff members found</p>
            <p className="text-gray-400 text-sm mt-1">Add staff to your salon first</p>
            <Link href={`/owner/salons/${salonId}/staff`}>
              <Button className="mt-4 bg-amber-400 hover:bg-amber-500 text-white">
                Manage Staff
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {staffList.map((member) => (
              <BarberCard
                key={member.id}
                member={member}
                onStatusChange={handleStatusChange}
                onQueueChange={handleQueueChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
