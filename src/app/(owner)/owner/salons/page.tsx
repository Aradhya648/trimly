'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Salon } from '@/types'

export default function OwnerSalonsPage() {
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    name: '', description: '', city: '', area: '', address: '',
    phone: '', email: '', cover_image_url: '',
  })

  useEffect(() => {
    fetch('/api/owner/salons')
      .then((r) => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        return r.json()
      })
      .then((j) => {
        if (j) setSalons(j.data ?? [])
        setLoading(false)
      })
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.city || !form.address) {
      toast.error('Name, city, and address are required')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/owner/salons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create salon')
      toast.success('Salon created!')
      setSalons((prev) => [json.data, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '', city: '', area: '', address: '', phone: '', email: '', cover_image_url: '' })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create salon')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Salons</h1>
          <Button onClick={() => setShowCreate(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Salon
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No salons yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first salon to get started</p>
            <Button onClick={() => setShowCreate(true)} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Salon
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {salons.map((salon) => (
              <div key={salon.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-white text-lg">{salon.name}</h2>
                      {salon.is_active ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {salon.area}, {salon.city}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/owner/salons/${salon.id}/bookings`}>
                      <Button variant="ghost" size="sm" className="text-slate-400">Bookings</Button>
                    </Link>
                    <Link href={`/owner/salons/${salon.id}/services`}>
                      <Button variant="ghost" size="sm" className="text-slate-400">
                        <Settings className="w-4 h-4 mr-1" /> Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create salon dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Salon</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Field label="Salon Name *" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="e.g. Fade & Style" />
            <Field label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Brief description" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City *" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} placeholder="Mumbai" />
              <Field label="Area" value={form.area} onChange={(v) => setForm((p) => ({ ...p, area: v }))} placeholder="Bandra" />
            </div>
            <Field label="Address *" value={form.address} onChange={(v) => setForm((p) => ({ ...p, address: v }))} placeholder="Full address" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
              <Field label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="hello@salon.com" />
            </div>
            <Field label="Cover Image URL" value={form.cover_image_url} onChange={(v) => setForm((p) => ({ ...p, cover_image_url: v }))} placeholder="https://..." />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-400">Cancel</Button>
              <Button onClick={handleCreate} disabled={creating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {creating ? 'Creating...' : 'Create Salon'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-slate-300 text-sm">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
    </div>
  )
}
