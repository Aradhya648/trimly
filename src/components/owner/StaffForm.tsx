'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Service, Staff } from '@/types'

interface Props {
  initial?: Partial<Staff>
  services: Service[]
  selectedServiceIds?: string[]
  onSubmit: (data: { name: string; bio: string; avatar_url: string; service_ids: string[] }) => Promise<void>
  onCancel: () => void
}

export default function StaffForm({ initial, services, selectedServiceIds = [], onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? '')
  const [serviceIds, setServiceIds] = useState<string[]>(selectedServiceIds)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleService = (id: string) => {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!name) {
      setError('Name is required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({ name, bio, avatar_url: avatarUrl, service_ids: serviceIds })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save staff member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label className="text-slate-300">Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Staff member name"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-slate-300">Bio</Label>
        <Input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio or specialty"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-slate-300">Avatar URL</Label>
        <Input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      {services.length > 0 && (
        <div className="grid gap-2">
          <Label className="text-slate-300">Services offered</Label>
          <div className="flex flex-wrap gap-2">
            {services.map((svc) => {
              const selected = serviceIds.includes(svc.id)
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {svc.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400">Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          {loading ? 'Saving...' : 'Save Staff'}
        </Button>
      </div>
    </div>
  )
}
