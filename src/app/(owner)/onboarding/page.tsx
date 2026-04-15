'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Trash2, Star, Upload, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ─────────────────────────────────────────────────────────────────
interface SalonForm {
  name: string
  description: string
  city: string
  area: string
  address: string
  phone: string
  email: string
}

interface StaffEntry {
  name: string
  specialty: string
  experience_years: string
}

interface ServiceEntry {
  name: string
  duration_mins: number
  price: string
  is_best_seller: boolean
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90]

// ─── Step Dot Progress ───────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? 'w-4 h-4 bg-amber-400'
              : i === current
              ? 'w-5 h-5 bg-amber-400 ring-4 ring-amber-400/30'
              : 'w-4 h-4 bg-amber-400/25'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Field component ────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400"
      />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Step 1
  const [salonForm, setSalonForm] = useState<SalonForm>({
    name: '', description: '', city: '', area: '', address: '', phone: '', email: '',
  })

  // Step 2
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Step 3
  const [staffList, setStaffList] = useState<StaffEntry[]>([
    { name: '', specialty: '', experience_years: '' },
  ])

  // Step 4
  const [serviceList, setServiceList] = useState<ServiceEntry[]>([
    { name: '', duration_mins: 30, price: '', is_best_seller: false },
  ])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const client = createClient()
      setSupabase(client)
      client.auth.getUser().then(({ data: { user } }) => {
        if (!user) router.push('/auth/login')
        else setUserId(user.id)
      })
    })
  }, [router])

  // ── Step 1 validation ──
  const step1Valid = salonForm.name.trim() && salonForm.city.trim() && salonForm.address.trim()

  // ── Step 3 validation ──
  const step3Valid = staffList.length > 0 && staffList.every((s) => s.name.trim())

  // ── Step 4 validation ──
  const step4Valid = serviceList.length > 0 && serviceList.every((s) => s.name.trim() && s.price)

  // ─── Cover Photo ───────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
    setCoverUrl(null)
  }

  const handleUpload = async () => {
    if (!coverFile || !supabase || !userId) return
    setUploading(true)
    try {
      const ext = coverFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}-cover.${ext}`
      const { error } = await supabase.storage
        .from('salon-images')
        .upload(path, coverFile)
      if (error) throw error
      const { data } = supabase.storage.from('salon-images').getPublicUrl(path)
      setCoverUrl(data.publicUrl)
      toast.success('Cover photo uploaded!')
    } catch (err) {
      toast.error('Upload failed. You can skip this step.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  // ─── Staff helpers ─────────────────────────────────────────────────────────
  const updateStaff = (idx: number, field: keyof StaffEntry, val: string) => {
    setStaffList((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)))
  }
  const addStaff = () => {
    if (staffList.length < 5) setStaffList((p) => [...p, { name: '', specialty: '', experience_years: '' }])
  }
  const removeStaff = (idx: number) => setStaffList((p) => p.filter((_, i) => i !== idx))

  // ─── Service helpers ───────────────────────────────────────────────────────
  const updateService = (idx: number, field: keyof ServiceEntry, val: string | number | boolean) => {
    setServiceList((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    )
  }
  const toggleBestSeller = (idx: number) => {
    setServiceList((prev) =>
      prev.map((s, i) => ({ ...s, is_best_seller: i === idx ? !s.is_best_seller : false }))
    )
  }
  const addService = () => {
    setServiceList((p) => [...p, { name: '', duration_mins: 30, price: '', is_best_seller: false }])
  }
  const removeService = (idx: number) => setServiceList((p) => p.filter((_, i) => i !== idx))

  // ─── Launch ────────────────────────────────────────────────────────────────
  const handleLaunch = async () => {
    setSubmitting(true)
    try {
      // 1. Create salon
      const salonRes = await fetch('/api/owner/salons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...salonForm,
          cover_image_url: coverUrl ?? '',
        }),
      })
      const salonJson = await salonRes.json()
      if (!salonRes.ok) throw new Error(salonJson.error || 'Failed to create salon')
      const salonId: string = salonJson.data.id

      // 2. Create staff
      for (const s of staffList) {
        if (!s.name.trim()) continue
        await fetch(`/api/owner/salons/${salonId}/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: s.name.trim(),
            bio: s.specialty ? `${s.specialty}${s.experience_years ? ` · ${s.experience_years} yrs` : ''}` : '',
          }),
        })
      }

      // 3. Create services
      for (const svc of serviceList) {
        if (!svc.name.trim()) continue
        await fetch(`/api/owner/salons/${salonId}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: svc.name.trim(),
            duration_mins: svc.duration_mins,
            price: parseFloat(svc.price) || 0,
          }),
        })
      }

      toast.success("Your salon is live! Welcome to Trimly!")
      router.push('/owner/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────
  const canNext = [
    !!step1Valid,
    true, // cover photo is optional
    !!step3Valid,
    !!step4Valid,
    true,
  ]

  const goNext = () => { if (step < 4) setStep((s) => s + 1) }
  const goBack = () => { if (step > 0) setStep((s) => s - 1) }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-extrabold text-xl tracking-tight">trimly</span>
          <span className="text-gray-400 text-sm">for owners</span>
        </div>
        <button
          onClick={() => router.push('/owner/dashboard')}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          <X className="w-4 h-4" /> Exit
        </button>
      </div>

      <main className="max-w-xl mx-auto px-4 py-8">
        <StepDots current={step} total={5} />

        <div className="text-center mb-1">
          <p className="text-gray-400 text-sm font-medium">Step {step + 1} of 5</p>
        </div>

        {/* ── STEP 1: Salon Details ── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Salon Details</h1>
            <p className="text-gray-500 text-sm mb-6">Tell customers about your salon.</p>
            <div className="flex flex-col gap-4">
              <Field label="Salon Name" value={salonForm.name} required onChange={(v) => setSalonForm((p) => ({ ...p, name: v }))} placeholder="e.g. Fade & Style" />
              <Field label="Description" value={salonForm.description} onChange={(v) => setSalonForm((p) => ({ ...p, description: v }))} placeholder="What makes your salon special?" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={salonForm.city} required onChange={(v) => setSalonForm((p) => ({ ...p, city: v }))} placeholder="Mumbai" />
                <Field label="Area" value={salonForm.area} onChange={(v) => setSalonForm((p) => ({ ...p, area: v }))} placeholder="Bandra" />
              </div>
              <Field label="Address" value={salonForm.address} required onChange={(v) => setSalonForm((p) => ({ ...p, address: v }))} placeholder="Full street address" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" value={salonForm.phone} onChange={(v) => setSalonForm((p) => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
                <Field label="Email" value={salonForm.email} onChange={(v) => setSalonForm((p) => ({ ...p, email: v }))} placeholder="hello@salon.com" type="email" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Cover Photo ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Add a Cover Photo</h1>
            <p className="text-gray-500 text-sm mb-6">A great photo attracts more bookings. You can skip this.</p>

            {coverPreview ? (
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-colors mb-4 bg-amber-50">
                <Upload className="w-8 h-8 text-amber-300 mb-2" />
                <span className="text-gray-500 text-sm">Click to select an image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            )}

            {coverFile && !coverUrl && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold"
              >
                {uploading ? 'Uploading…' : 'Upload Photo'}
              </Button>
            )}

            {coverUrl && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Photo uploaded successfully
              </div>
            )}

            {coverFile && (
              <button
                onClick={() => { setCoverFile(null); setCoverPreview(null); setCoverUrl(null) }}
                className="mt-3 text-gray-400 text-sm hover:text-red-500 transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>
        )}

        {/* ── STEP 3: Team ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Your Team</h1>
            <p className="text-gray-500 text-sm mb-6">At least 1 team member required.</p>
            <div className="flex flex-col gap-4">
              {staffList.map((s, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700 text-sm">Barber {i + 1}</span>
                    {staffList.length > 1 && (
                      <button onClick={() => removeStaff(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Field
                      label="Name"
                      required
                      value={s.name}
                      onChange={(v) => updateStaff(i, 'name', v)}
                      placeholder="e.g. Rahul Sharma"
                    />
                    <Field
                      label="Specialty"
                      value={s.specialty}
                      onChange={(v) => updateStaff(i, 'specialty', v)}
                      placeholder="e.g. Haircut & Beard"
                    />
                    <Field
                      label="Experience (years)"
                      value={s.experience_years}
                      onChange={(v) => updateStaff(i, 'experience_years', v)}
                      placeholder="e.g. 5"
                      type="number"
                    />
                  </div>
                </div>
              ))}

              {staffList.length < 5 && (
                <button
                  onClick={addStaff}
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium py-2 border border-dashed border-amber-300 rounded-xl justify-center hover:border-amber-400 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Another
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4: Services ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Services</h1>
            <p className="text-gray-500 text-sm mb-6">Add the services you offer. Mark your best seller with ⭐.</p>
            <div className="flex flex-col gap-4">
              {serviceList.map((svc, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 text-sm">Service {i + 1}</span>
                      {svc.is_best_seller && (
                        <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full font-medium">Best Seller ⭐</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBestSeller(i)}
                        title="Mark as Best Seller"
                        className={`transition-colors ${svc.is_best_seller ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
                      >
                        <Star className="w-4 h-4" fill={svc.is_best_seller ? 'currentColor' : 'none'} />
                      </button>
                      {serviceList.length > 1 && (
                        <button onClick={() => removeService(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Field
                      label="Service Name"
                      required
                      value={svc.name}
                      onChange={(v) => updateService(i, 'name', v)}
                      placeholder="e.g. Classic Haircut"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-sm font-medium text-gray-700">Duration</Label>
                        <select
                          value={svc.duration_mins}
                          onChange={(e) => updateService(i, 'duration_mins', parseInt(e.target.value))}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400"
                        >
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d} min</option>
                          ))}
                        </select>
                      </div>
                      <Field
                        label="Price (₹)"
                        required
                        value={svc.price}
                        onChange={(v) => updateService(i, 'price', v)}
                        placeholder="e.g. 299"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addService}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium py-2 border border-dashed border-amber-300 rounded-xl justify-center hover:border-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Another Service
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Go Live! ── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Go Live!</h1>
              <p className="text-gray-500 text-sm">Here&apos;s a summary of your salon setup.</p>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Salon */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Salon</h3>
                <p className="font-bold text-gray-900">{salonForm.name}</p>
                <p className="text-gray-500 text-sm">{salonForm.area ? `${salonForm.area}, ` : ''}{salonForm.city}</p>
                {salonForm.description && <p className="text-gray-500 text-sm mt-1">{salonForm.description}</p>}
              </div>

              {/* Cover */}
              {coverUrl && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Cover Photo</h3>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="Cover" className="w-full h-28 object-cover rounded-lg" />
                </div>
              )}

              {/* Team */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Team ({staffList.filter(s => s.name).length} members)</h3>
                <div className="flex flex-wrap gap-2">
                  {staffList.filter(s => s.name).map((s, i) => (
                    <span key={i} className="bg-white border border-amber-200 rounded-full px-3 py-1 text-sm text-gray-700">
                      {s.name}{s.specialty ? ` · ${s.specialty}` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Services ({serviceList.filter(s => s.name).length})</h3>
                <div className="flex flex-col gap-1.5">
                  {serviceList.filter(s => s.name).map((svc, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {svc.name}
                        {svc.is_best_seller && ' ⭐'}
                      </span>
                      <span className="text-amber-600 font-semibold">
                        ₹{svc.price} · {svc.duration_mins}min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleLaunch}
              disabled={submitting}
              className="w-full mt-6 bg-amber-400 hover:bg-amber-500 text-white font-bold text-base py-3 rounded-xl"
            >
              {submitting ? 'Launching…' : 'Launch My Salon 🚀'}
            </Button>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
            className="text-gray-500 hover:text-gray-700 gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {step < 4 && (
            <Button
              onClick={goNext}
              disabled={!canNext[step]}
              className="bg-amber-400 hover:bg-amber-500 text-white font-semibold gap-1 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === 1 && (
            <Button
              variant="ghost"
              onClick={goNext}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
