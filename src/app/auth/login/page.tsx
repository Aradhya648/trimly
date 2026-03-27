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
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      toast.error('Enter a valid phone number')
      return
    }
    // Ensure E.164 format
    const formatted = digits.startsWith('91') && digits.length === 12
      ? `+${digits}`
      : digits.length === 10
      ? `+91${digits}`
      : `+${digits}`

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send OTP')
      toast.success('OTP sent!')
      router.push(`/auth/verify?phone=${encodeURIComponent(formatted)}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scissors className="w-6 h-6 text-emerald-400" />
          <span className="text-2xl font-bold text-white">Trimly</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your phone number to get started</p>

          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 text-slate-400 text-sm shrink-0">
                  🇮🇳 +91
                </div>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                  maxLength={15}
                />
              </div>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
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
