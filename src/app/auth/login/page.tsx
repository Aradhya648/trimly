'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Enter both email and password')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Authentication failed')
      toast.success('Logged in!')
      // Redirect based on role (if known)
      const role = json.user?.user_metadata?.role
      router.push(role === 'owner' ? '/owner/dashboard' : '/')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scissors className="w-6 h-6 text-emerald-400" />
          <span className="text-2xl font-bold text-white">Trimly</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome to Trimly</h1>
          <p className="text-slate-400 text-sm mb-6">Sign in with your email and password</p>

          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                autoComplete="current-password"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <p className="text-slate-500 text-xs text-center mt-6">
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </main>
  )
}
