'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') ?? ''
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'customer' | 'owner'>('customer')
  const [step, setStep] = useState<'otp' | 'profile'>('otp')
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token: otp }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Invalid OTP')

      if (json.isNew) {
        setIsNew(true)
        setStep('profile')
      } else {
        toast.success('Welcome back!')
        router.push(redirectTo)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, role }),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      toast.success('Profile saved!')
      router.push(role === 'owner' ? '/owner/dashboard' : redirectTo)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save profile')
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
          {step === 'otp' ? (
            <>
              <h1 className="text-xl font-semibold text-white mb-1">Verify your number</h1>
              <p className="text-slate-400 text-sm mb-6">
                We sent a 6-digit code to <span className="text-white">{phone}</span>
              </p>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-300">OTP Code</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="bg-slate-800 border-slate-700 text-white tracking-widest text-center text-lg"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                  className="text-slate-500"
                >
                  ← Change number
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white mb-1">Complete your profile</h1>
              <p className="text-slate-400 text-sm mb-6">Tell us a bit about yourself</p>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Your Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['customer', 'owner'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-colors capitalize ${
                          role === r
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {r === 'customer' ? '💈 Customer' : '🏪 Salon Owner'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleProfile}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11"
                >
                  {loading ? 'Saving...' : 'Get Started'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
