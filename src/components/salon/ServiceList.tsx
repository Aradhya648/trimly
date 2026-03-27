import { Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

interface Props {
  services: Service[]
}

export default function ServiceList({ services }: Props) {
  if (services.length === 0) {
    return <p className="text-slate-500 text-sm">No services listed yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3"
        >
          <div>
            <p className="text-white font-medium">{service.name}</p>
            {service.description && (
              <p className="text-slate-400 text-sm mt-0.5">{service.description}</p>
            )}
            <span className="flex items-center gap-1 text-slate-500 text-xs mt-1">
              <Clock className="w-3 h-3" />
              {service.duration_mins} min
            </span>
          </div>
          <span className="text-emerald-400 font-semibold text-lg shrink-0 ml-4">
            {formatCurrency(service.price)}
          </span>
        </div>
      ))}
    </div>
  )
}
