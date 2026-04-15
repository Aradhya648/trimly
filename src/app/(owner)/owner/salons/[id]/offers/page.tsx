'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Tag, Calendar, Percent, X } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Offer } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isExpired(validUntil: string | null) {
  if (!validUntil) return false
  return new Date(validUntil) < new Date()
}

// ─── Create Offer Modal ──────────────────────────────────────────────────────
interface CreateOfferModalProps {
  salonId: string
  onClose: () => void
  onCreated: (offer: Offer) => void
}

function CreateOfferModal({ salonId, onClose, onCreated }: CreateOfferModalProps) {
  const [form, setForm] = useState({
    title: '',
    discount_pct: '',
    code: '',
    valid_until: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }

    setSaving(true)
    try {
      const res = await fetch(`/api/owner/salons/${salonId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          discount_pct: form.discount_pct ? parseFloat(form.discount_pct) : null,
          code: form.code || null,
          valid_until: form.valid_until || null,
          description: form.description || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create offer')
      toast.success('Offer created!')
      onCreated(json.data)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create Offer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Title <span className="text-amber-500">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Happy Hour 20% Off"
              className="border-gray-200 focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-gray-700">Discount %</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={form.discount_pct}
                onChange={(e) => setForm((p) => ({ ...p, discount_pct: e.target.value }))}
                placeholder="e.g. 20"
                className="border-gray-200 focus:border-amber-400"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-gray-700">Promo Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. TRIM20"
                className="border-gray-200 focus:border-amber-400 uppercase"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Valid Until</Label>
            <Input
              type="date"
              value={form.valid_until}
              onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))}
              className="border-gray-200 focus:border-amber-400"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional details about this offer…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-3 mt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-gray-500">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold"
            >
              {saving ? 'Creating…' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function OffersPage() {
  const { id: salonId } = useParams<{ id: string }>()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/owner/salons/${salonId}/offers`)
    if (res.status === 401) { router.push('/auth/login'); return }
    const json = await res.json()
    setOffers(json.data ?? [])
    setLoading(false)
  }, [salonId, router])

  useEffect(() => { load() }, [load])

  const handleDelete = async (offerId: string) => {
    if (!confirm('Delete this offer?')) return
    setDeleting(offerId)
    try {
      const res = await fetch(`/api/owner/salons/${salonId}/offers?offer_id=${offerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Offer deleted')
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch {
      toast.error('Failed to delete offer')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/owner/salons">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Offers &amp; Promotions</h1>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Offer
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-amber-100" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-sm">
            <Tag className="w-10 h-10 text-amber-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No offers yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first promotion to attract more customers</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="mt-4 bg-amber-400 hover:bg-amber-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Create Offer
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((offer) => {
              const expired = isExpired(offer.valid_until)
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{offer.title}</h3>
                      {/* Active / Inactive / Expired badge */}
                      {expired ? (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Expired</span>
                      ) : offer.is_active ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>

                    {offer.description && (
                      <p className="text-gray-500 text-sm mt-1">{offer.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      {offer.discount_pct != null && (
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Percent className="w-3.5 h-3.5" />
                          {offer.discount_pct}% off
                        </span>
                      )}
                      {offer.code && (
                        <span className="bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-amber-700 font-mono text-xs font-bold">
                          {offer.code}
                        </span>
                      )}
                      {offer.valid_until && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Until {formatDate(offer.valid_until)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={deleting === offer.id}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    title="Delete offer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateOfferModal
          salonId={salonId}
          onClose={() => setShowCreate(false)}
          onCreated={(offer) => setOffers((prev) => [offer, ...prev])}
        />
      )}
    </div>
  )
}
