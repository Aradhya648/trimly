import { z } from 'zod'

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
})

export const verifyOtpSchema = z.object({
  phone: z.string(),
  token: z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits'),
})

export const createBookingSchema = z.object({
  salon_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  service_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
})

export const createSalonSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  city: z.string().min(2).max(100),
  area: z.string().max(100).optional(),
  address: z.string().min(5).max(300),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional().transform(v => v || undefined),
  cover_image_url: z.union([z.string().url(), z.literal('')]).optional().transform(v => v || undefined),
})

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  duration_mins: z.number().int().min(5).max(480),
  price: z.number().min(0),
})

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(300).optional(),
  avatar_url: z.union([z.string().url(), z.literal('')]).optional().transform(v => v || undefined),
  service_ids: z.array(z.string().uuid()).optional(),
})

export const createSlotSchema = z.object({
  staff_id: z.string().uuid(),
  salon_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CreateSalonInput = z.infer<typeof createSalonSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type CreateSlotInput = z.infer<typeof createSlotSchema>
