'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import StaffForm from '@/components/owner/StaffForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getInitials } from '@/lib/utils'
import type { Staff, Service } from '@/types'

export default function OwnerStaffPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)

  const load = async () => {
    const [staffRes, servicesRes] = await Promise.all([
      fetch(`/api/owner/salons/${salonId}/staff`),
      fetch(`/api/owner/salons/${salonId}/services`),
    ])
    if (staffRes.status === 401) { router.push('/auth/login'); return }
    const staffJson = await staffRes.json()
    const servicesJson = await servicesRes.json()
    setStaff(staffJson.data ?? [])
    setServices(servicesJson.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [salonId])

  const handleAdd = async (data: { name: string; bio: string; avatar_url: string; service_ids: string[] }) => {
    const res = await fetch(`/api/owner/salons/${salonId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to add staff')
    toast.success('Staff member added!')
    load()
    setShowAdd(false)
  }

  const handleEdit = async (data: { name: string; bio: string; avatar_url: string; service_ids: string[] }) => {
    if (!editing) return
    const res = await fetch(`/api/owner/salons/${salonId}/staff?staff_id=${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to update staff')
    toast.success('Staff updated!')
    load()
    setEditing(null)
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm('Delete this staff member?')) return
    const res = await fetch(`/api/owner/salons/${salonId}/staff?staff_id=${staffId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete staff'); return }
    toast.success('Staff member deleted')
    setStaff((prev) => prev.filter((s) => s.id !== staffId))
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
          <h1 className="text-2xl font-bold flex-1">Staff</h1>
          <div className="flex gap-2">
            <Link href={`/owner/salons/${salonId}/services`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Services</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/availability`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Availability</Button>
            </Link>
            <Link href={`/owner/salons/${salonId}/bookings`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Bookings</Button>
            </Link>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No staff members yet</p>
            <Button onClick={() => setShowAdd(true)} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Staff
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {staff.map((member) => (
              <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold shrink-0">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    getInitials(member.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  {member.bio && <p className="text-slate-400 text-sm truncate">{member.bio}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(member)} className="text-slate-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <StaffForm services={services} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
          {editing && (
            <StaffForm initial={editing} services={services} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
