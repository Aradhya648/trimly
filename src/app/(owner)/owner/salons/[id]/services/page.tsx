'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import ServiceForm from '@/components/owner/ServiceForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

export default function OwnerServicesPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const load = () => {
    fetch(`/api/owner/salons/${salonId}/services`)
      .then((r) => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setServices(j.data ?? [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [salonId])

  const handleAdd = async (data: { name: string; description: string; duration_mins: number; price: number }) => {
    const res = await fetch(`/api/owner/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to add service')
    toast.success('Service added!')
    load()
    setShowAdd(false)
  }

  const handleEdit = async (data: { name: string; description: string; duration_mins: number; price: number }) => {
    if (!editing) return
    const res = await fetch(`/api/owner/salons/${salonId}/services?service_id=${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to update service')
    toast.success('Service updated!')
    load()
    setEditing(null)
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Delete this service?')) return
    const res = await fetch(`/api/owner/salons/${salonId}/services?service_id=${serviceId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete service'); return }
    toast.success('Service deleted')
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
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
          <h1 className="text-2xl font-bold flex-1">Services</h1>
          <div className="flex gap-2">
            <Link href={`/owner/salons/${salonId}/staff`}>
              <Button variant="ghost" size="sm" className="text-slate-400">Staff</Button>
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
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No services yet</p>
            <Button onClick={() => setShowAdd(true)} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((svc) => (
              <div key={svc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{svc.name}</h3>
                  {svc.description && <p className="text-slate-400 text-sm mt-0.5">{svc.description}</p>}
                  <div className="flex gap-3 mt-1.5 text-sm text-slate-400">
                    <span>{svc.duration_mins} min</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(svc.price)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(svc)} className="text-slate-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(svc.id)} className="text-slate-400 hover:text-red-400">
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
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <ServiceForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          {editing && (
            <ServiceForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
