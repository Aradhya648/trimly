'use client'

import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import BookingStatusBadge from '@/components/booking/BookingStatusBadge'
import type { BookingWithDetails } from '@/types'

interface Props {
  bookings: BookingWithDetails[]
  onComplete?: (bookingId: string) => void
}

export default function BookingsTable({ bookings, onComplete }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No bookings yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Customer</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Service</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Staff</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Date & Time</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
            {onComplete && <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="py-3 px-4 text-white">
                {'customer' in booking && (booking as BookingWithDetails & { customer?: { full_name: string } }).customer?.full_name || '—'}
              </td>
              <td className="py-3 px-4 text-slate-300">{booking.service.name}</td>
              <td className="py-3 px-4 text-slate-300">{booking.staff.name}</td>
              <td className="py-3 px-4 text-slate-400">
                {formatDate(booking.slot.date)}<br />
                <span className="text-xs">{formatTime(booking.slot.start_time)}</span>
              </td>
              <td className="py-3 px-4 text-emerald-400 font-medium">{formatCurrency(booking.payment_amount)}</td>
              <td className="py-3 px-4">
                <BookingStatusBadge status={booking.status} />
              </td>
              {onComplete && (
                <td className="py-3 px-4">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => onComplete(booking.id)}
                      className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg px-2 py-1 hover:bg-blue-500/20 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
