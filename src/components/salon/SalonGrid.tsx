import SalonCard from './SalonCard'
import type { Salon } from '@/types'

interface Props {
  salons: Salon[]
}

export default function SalonGrid({ salons }: Props) {
  if (salons.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <div className="text-5xl mb-4">✂️</div>
        <p className="text-lg font-medium text-slate-400">No salons found</p>
        <p className="text-sm mt-1">Try adjusting your search or location</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {salons.map((salon) => (
        <SalonCard key={salon.id} salon={salon} />
      ))}
    </div>
  )
}
