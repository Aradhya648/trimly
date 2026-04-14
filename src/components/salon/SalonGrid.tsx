import SalonCard from './SalonCard'
import type { Salon } from '@/types'

interface Props {
  salons: Salon[]
}

export default function SalonGrid({ salons }: Props) {
  if (salons.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">✂️</div>
        <p className="text-base font-semibold text-gray-600">No salons found</p>
        <p className="text-sm mt-1">Try adjusting your search or location</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {salons.map((salon) => (
        <SalonCard key={salon.id} salon={salon} />
      ))}
    </div>
  )
}
