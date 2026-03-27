import Link from 'next/link'
import { Calendar, Clock, Scissors, User } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import BookingStatusBadge from './BookingStatusBadge'
import type { BookingWithDetails } from '@/types'

interface Props {
  booking: BookingWithDetails
}

export default function BookingCard({ booking }: Props) {
  return (
    <Link href={`/bookings/${booking.id}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                {booking.salon.name}
              </h3>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="flex flex-wrap gap-3 text-slate-400 text-sm mt-2">
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-emerald-500" />
                {booking.service.name}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                {booking.staff.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {formatDate(booking.slot.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                {formatTime(booking.slot.start_time)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-400 font-bold text-lg">
              {formatCurrency(booking.payment_amount)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
