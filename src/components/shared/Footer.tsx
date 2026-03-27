import Link from 'next/link'
import { Scissors } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-semibold">Trimly</span>
        </div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Trimly. All rights reserved.</p>
        <div className="flex gap-4 text-slate-500 text-sm">
          <Link href="/salons" className="hover:text-white transition-colors">Browse Salons</Link>
          <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  )
}
