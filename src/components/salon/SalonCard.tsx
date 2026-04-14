import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Clock } from 'lucide-react'
import type { Salon } from '@/types'

interface Props {
  salon: Salon
}

export default function SalonCard({ salon }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* Cover Image */}
      <div className="relative h-40 bg-gray-100">
        {salon.cover_image_url ? (
          <Image
            src={salon.cover_image_url}
            alt={salon.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">
            ✂️
          </div>
        )}
        {!salon.is_active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
              Closed
            </span>
          </div>
        )}
        {salon.min_price != null && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            from ₹{salon.min_price}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
              {salon.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {[salon.area, salon.city].filter(Boolean).join(', ')}
              </span>
              {salon.lat && salon.lng && (
                <>
                  <span className="text-gray-200">•</span>
                  <span className="text-gray-400">~2 km</span>
                </>
              )}
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-600">4.8</span>
          </div>
        </div>

        {/* Next slot + Book Now */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-emerald-600 font-medium">Next available</span>
          </div>
          <Link href={`/salons/${salon.id}`}>
            <button className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
