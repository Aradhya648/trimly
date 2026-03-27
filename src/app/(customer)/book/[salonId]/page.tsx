'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import BookingSteps from '@/components/booking/BookingSteps'
import SlotPicker from '@/components/booking/SlotPicker'
import StaffCard from '@/components/salon/StaffCard'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SalonWithDetails, Service, Staff, AvailabilitySlot } from '@/types'

const STEPS = ['Service', 'Staff', 'Time', 'Confirm']

interface Props {
  params: Promise<{ salonId: string }>
}

export default function BookPage({ params }: Props) {
  const { salonId } = use(params)
  const router = useRouter()

  const [salon, setSalon] = useState<SalonWithDetails | null>(null)
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetch(`/api/salons/${salonId}`)
      .then((r) => r.json())
      .then((j) => {
        setSalon(j.data)
        setLoading(false)
      })
  }, [salonId])

  useEffect(() => {
    if (!selectedStaff || !selectedDate) return
    setSlotsLoading(true)
    fetch(`/api/salons/${salonId}/availability?staff_id=${selectedStaff.id}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((j) => {
        setSlots(j.data ?? [])
        setSelectedSlot(null)
      })
      .finally(() => setSlotsLoading(false))
  }, [selectedStaff, selectedDate, salonId])

  const handleBook = async () => {
    if (!selectedService || !selectedStaff || !selectedSlot) {
      toast.error('Please complete all steps')
      return
    }
    setBooking(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon_id: salonId,
          staff_id: selectedStaff.id,
          service_id: selectedService.id,
          slot_id: selectedSlot.id,
          notes,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Please login to book')
          router.push(`/auth/login?redirectTo=/book/${salonId}`)
          return
        }
        throw new Error(json.error || 'Booking failed')
      }
      toast.success('Booking confirmed!')
      router.push(`/bookings/${json.data.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading || !salon) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Filter staff by selected service
  const eligibleStaff = selectedService
    ? salon.staff.filter((s) =>
        (s as Staff & { services?: { id: string }[] }).services?.some(
          (sv) => sv.id === selectedService.id
        ) ?? true
      )
    : salon.staff

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-2 text-slate-400 text-sm">
          Booking at <span className="text-white font-medium">{salon.name}</span>
        </div>
        <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>

        <div className="flex justify-center mb-8">
          <BookingSteps currentStep={step} steps={STEPS} />
        </div>

        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose a service</h2>
            {salon.services.length === 0 ? (
              <p className="text-slate-500">No services available.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {salon.services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      selectedService?.id === svc.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${selectedService?.id === svc.id ? 'text-emerald-400' : 'text-white'}`}>
                        {svc.name}
                      </p>
                      {svc.description && <p className="text-slate-400 text-sm mt-0.5">{svc.description}</p>}
                      <p className="text-slate-500 text-xs mt-1">{svc.duration_mins} min</p>
                    </div>
                    <span className="text-emerald-400 font-semibold text-lg ml-4 shrink-0">
                      {formatCurrency(svc.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Next: Choose Staff →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Staff */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose your barber</h2>
            {eligibleStaff.length === 0 ? (
              <p className="text-slate-500">No staff available for this service.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {eligibleStaff.map((s) => (
                  <StaffCard
                    key={s.id}
                    staff={s}
                    selected={selectedStaff?.id === s.id}
                    onClick={() => setSelectedStaff(s)}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400">← Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedStaff}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Next: Choose Time →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Slot */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Pick a date and time</h2>
            <div className="mb-4">
              <Label className="text-slate-300 mb-2 block">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white max-w-xs"
              />
            </div>
            {selectedDate && (
              <div>
                <p className="text-slate-400 text-sm mb-3">Available slots for {formatDate(selectedDate)}</p>
                {slotsLoading ? (
                  <div className="text-slate-500 text-sm">Loading slots...</div>
                ) : (
                  <SlotPicker
                    slots={slots}
                    selectedSlotId={selectedSlot?.id ?? null}
                    onSelect={setSelectedSlot}
                  />
                )}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400">← Back</Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!selectedSlot}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Next: Confirm →
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && selectedStaff && selectedSlot && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Confirm your booking</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
              <div className="flex flex-col gap-3 text-sm">
                <Row label="Salon" value={salon.name} />
                <Row label="Service" value={`${selectedService.name} · ${selectedService.duration_mins} min`} />
                <Row label="Barber" value={selectedStaff.name} />
                <Row label="Date" value={formatDate(selectedSlot.date)} />
                <Row label="Time" value={formatTime(selectedSlot.start_time)} />
                <div className="border-t border-slate-800 pt-3">
                  <Row label="Total" value={formatCurrency(selectedService.price)} highlight />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Label className="text-slate-300 mb-2 block">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)} className="text-slate-400">← Back</Button>
              <Button
                onClick={handleBook}
                disabled={booking}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'text-emerald-400 font-bold text-base' : 'text-white font-medium'}>{value}</span>
    </div>
  )
}
