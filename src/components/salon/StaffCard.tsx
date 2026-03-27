import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import type { Staff } from '@/types'

interface Props {
  staff: Staff
  selected?: boolean
  onClick?: () => void
}

export default function StaffCard({ staff, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
      }`}
    >
      <div className="relative w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
        {staff.avatar_url ? (
          <Image src={staff.avatar_url} alt={staff.name} fill className="object-cover" />
        ) : (
          <span className="text-slate-300 font-semibold text-sm">{getInitials(staff.name)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-medium text-sm ${selected ? 'text-emerald-400' : 'text-white'}`}>
          {staff.name}
        </p>
        {staff.bio && (
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{staff.bio}</p>
        )}
      </div>
    </div>
  )
}
