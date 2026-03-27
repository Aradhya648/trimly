'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Service } from '@/types'

interface Props {
  initial?: Partial<Service>
  onSubmit: (data: { name: string; description: string; duration_mins: number; price: number }) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [duration, setDuration] = useState(String(initial?.duration_mins ?? 30))
  const [price, setPrice] = useState(String(initial?.price ?? 0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name || !duration || !price) {
      setError('Name, duration, and price are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        name,
        description,
        duration_mins: parseInt(duration),
        price: parseFloat(price),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label className="text-slate-300">Service Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Haircut"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-slate-300">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="text-slate-300">Duration (minutes) *</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={5}
            max={480}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-slate-300">Price (₹) *</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400">Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          {loading ? 'Saving...' : 'Save Service'}
        </Button>
      </div>
    </div>
  )
}
