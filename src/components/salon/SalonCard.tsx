import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Salon } from '@/types'

interface Props {
  salon: Salon
}

export default function SalonCard({ salon }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
      <div className="relative h-44 bg-slate-800">
        {salon.cover_image_url ? (
          <Image
            src={salon.cover_image_url}
            alt={salon.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-5xl">✂️</div>
        )}
        {!salon.is_active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="secondary">Inactive</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-white text-lg leading-tight">{salon.name}</h3>
          {salon.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{salon.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 text-slate-500 text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {salon.area}, {salon.city}
          </span>
          {salon.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {salon.phone}
            </span>
          )}
        </div>
        <Link href={`/salons/${salon.id}`}>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            View & Book
          </Button>
        </Link>
      </div>
    </div>
  )
}
