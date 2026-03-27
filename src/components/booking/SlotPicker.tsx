'use client'

import { useState } from 'react'
import { formatTime } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types'

interface Props {
  slots: AvailabilitySlot[]
  selectedSlotId: string | null
  onSelect: (slot: AvailabilitySlot) => void
}

export default function SlotPicker({ slots, selectedSlotId, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-6">
        No available slots for this date. Try another date.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId
        return (
          <button
            key={slot.id}
            onClick={() => onSelect(slot)}
            className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
              isSelected
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
            }`}
          >
            {formatTime(slot.start_time)}
          </button>
        )
      })}
    </div>
  )
}
