import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'

interface Props {
  status: BookingStatus
}

const config: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Completed', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
}

export default function BookingStatusBadge({ status }: Props) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
