export type UserRole = 'customer' | 'owner' | 'admin'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type NotificationType = 'confirmation' | 'cancellation' | 'reminder'
export type BarberStatusType = 'available' | 'busy' | 'break' | 'offline'

export interface Profile {
  id: string
  phone: string | null
  full_name: string
  role: UserRole
  avatar_url: string | null
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
  gallery_urls: string[]
  open_time: string
  close_time: string
  is_active: boolean
  created_at: string
  min_price?: number
}

export interface BarberStatus {
  staff_id: string
  status: BarberStatusType
  queue_len: number
  updated_at: string
}

export interface Staff {
  id: string
  salon_id: string
  name: string
  bio: string
  avatar_url: string
  specialty: string | null
  is_best_seller: boolean
  experience_years: number
  is_active: boolean
  created_at: string
  barber_status?: BarberStatus
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

export interface Offer {
  id: string
  salon_id: string
  title: string
  description: string | null
  discount_pct: number | null
  code: string | null
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  staff_id: string
  salon_id: string
  rating: number
  comment: string | null
  created_at: string
  customer?: Profile
}

export interface FavouriteBarber {
  id: string
  customer_id: string
  staff_id: string
  created_at: string
  staff?: Staff
}

export interface BusinessHours {
  id: string
  salon_id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
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
  customer?: Profile
  review?: Review
}

export interface SalonWithDetails extends Salon {
  services: Service[]
  staff: Staff[]
}
