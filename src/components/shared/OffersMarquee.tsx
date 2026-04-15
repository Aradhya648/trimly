'use client'

import { useEffect, useState, useRef } from 'react'
import { Tag } from 'lucide-react'

interface OfferItem {
  id: string
  title: string
  code: string | null
  discount_pct: number | null
  salon_name: string | null
}

export default function OffersMarquee() {
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((j) => {
        setOffers(j.data ?? [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded || offers.length === 0) return null

  const items = [...offers, ...offers] // duplicate for seamless loop

  return (
    <div className="bg-amber-400 overflow-hidden py-2 flex items-center gap-2">
      <div className="shrink-0 pl-3 pr-1">
        <Tag className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 overflow-hidden" ref={containerRef}>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {items.map((offer, i) => (
            <span key={`${offer.id}-${i}`} className="text-white text-xs font-medium inline-flex items-center gap-1.5">
              <span>✂️</span>
              <span>
                {offer.salon_name && `${offer.salon_name} — `}
                {offer.title}
                {offer.discount_pct != null && ` ${offer.discount_pct}% off`}
                {offer.code && ` with ${offer.code}`}
              </span>
              <span className="text-white/60 mx-2">•</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
