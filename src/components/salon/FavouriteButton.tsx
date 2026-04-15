'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

interface Props {
  staffId: string
}

export default function FavouriteButton({ staffId }: Props) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/favourites')
      .then((r) => {
        if (!r.ok) return null
        return r.json()
      })
      .then((j) => {
        if (j?.data) {
          const favs = j.data as { staff_id: string }[]
          setIsFav(favs.some((f) => f.staff_id === staffId))
        }
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [staffId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const method = isFav ? 'DELETE' : 'POST'
      const res = await fetch('/api/favourites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId }),
      })
      if (res.ok) {
        setIsFav(!isFav)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-1.5 rounded-full transition-all active:scale-90 ${
        isFav
          ? 'text-red-500 hover:text-red-600'
          : 'text-slate-400 hover:text-red-400'
      }`}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
    </button>
  )
}
