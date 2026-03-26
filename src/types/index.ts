export type UserRole = 'customer' | 'owner' | 'admin'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type NotificationType = 'confirmation' | 'cancellation' | 'reminder'

export interface Profile {
  id: string
  phone: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Salon {
  id: string
  owner_id: string
  name: string
  description: string
  city: string
  area: string
  address: string
  lat: number
  lng: number
  phone: string
  email: string
  cover_image_url: string
  is_active: boolean
  created_at: string
}

export interface Staff {
  id: string
  salon_id: string
  name: string
  bio: string
  avatar_url: string
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  salon_id: string
  name: string
  description: string
  duration_mins: number
  price: number
  is_active: boolean
  created_at: string
}

export interface StaffService {
  id: string
  staff_id: string
  service_id: string
}

export interface AvailabilitySlot {
  id: string
  staff_id: string
  salon_id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  salon_id: string
  staff_id: string
  service_id: string
  slot_id: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_amount: number
  notes: string
  cancelled_at: string | null
  created_at: string
}

export interface NotificationLog {
  id: string
  booking_id: string
  type: NotificationType
  sent_at: string
  status: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface BookingWithDetails extends Booking {
  salon: Salon
  staff: Staff
  service: Service
  slot: AvailabilitySlot
}

export interface SalonWithDetails extends Salon {
  services: Service[]
  staff: Staff[]
}
