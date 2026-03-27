'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatTime } from '@/lib/utils'
import type { AvailabilitySlot, Staff } from '@/types'

interface Props {
  staff: Staff[]
  slots: AvailabilitySlot[]
  date: string
  onDateChange: (date: string) => void
  onAddSlot: (staffId: string, startTime: string, endTime: string) => Promise<void>
  onDeleteSlot: (slotId: string) => Promise<void>
}

export default function SlotManager({ staff, slots, date, onDateChange, onAddSlot, onDeleteSlot }: Props) {
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id ?? '')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!selectedStaffId || !startTime || !endTime) {
      setError('Select staff and fill both times.')
      return
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.')
      return
    }
    setAdding(true)
    setError('')
    try {
      await onAddSlot(selectedStaffId, startTime, endTime)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add slot.')
    } finally {
      setAdding(false)
    }
  }

  const staffSlots = slots.filter((s) => s.staff_id === selectedStaffId)

  return (
    <div className="flex flex-col gap-6">
      {/* Date picker */}
      <div className="grid gap-2 max-w-xs">
        <Label className="text-slate-300">Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      {/* Staff tabs */}
      {staff.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStaffId(s.id)}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                selectedStaffId === s.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Add slot */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-white font-medium mb-3">Add New Slot</h3>
        <div className="flex flex-wrap gap-3 items-end">
          {staff.length === 1 && (
            <div className="grid gap-1">
              <Label className="text-slate-400 text-xs">Staff</Label>
              <p className="text-white text-sm px-1">{staff[0].name}</p>
            </div>
          )}
          <div className="grid gap-1">
            <Label className="text-slate-400 text-xs">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white w-36"
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-slate-400 text-xs">End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white w-36"
            />
          </div>
          <Button onClick={handleAdd} disabled={adding} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {adding ? 'Adding...' : 'Add Slot'}
          </Button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Slots list */}
      <div>
        <h3 className="text-white font-medium mb-3">
          Slots for {date || 'selected date'}
          {selectedStaffId && staff.length > 1 && ` — ${staff.find(s => s.id === selectedStaffId)?.name}`}
        </h3>
        {staffSlots.length === 0 ? (
          <p className="text-slate-500 text-sm">No slots added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {staffSlots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${
                  slot.is_booked
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>{formatTime(slot.start_time)}</span>
                {!slot.is_booked && (
                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    className="text-slate-600 hover:text-red-400 ml-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {slot.is_booked && <span className="text-xs ml-1">Booked</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
