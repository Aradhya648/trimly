import { Resend } from 'resend'
import type { BookingWithDetails } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Trimly <bookings@trimly.in>'

export async function sendBookingConfirmation(
  booking: BookingWithDetails,
  customerEmail: string,
  customerName: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Booking Confirmed — ${booking.salon.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Your booking is confirmed ✅</h2>
        <p>Hi ${customerName},</p>
        <p>Your appointment has been booked successfully.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Salon:</strong> ${booking.salon.name}</p>
          <p><strong>Service:</strong> ${booking.service.name}</p>
          <p><strong>Staff:</strong> ${booking.staff.name}</p>
          <p><strong>Date:</strong> ${formatDate(booking.slot.date)}</p>
          <p><strong>Time:</strong> ${formatTime(booking.slot.start_time)}</p>
          <p><strong>Address:</strong> ${booking.salon.address}, ${booking.salon.area}, ${booking.salon.city}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">You can cancel anytime from your bookings page.</p>
        <p>See you soon! ✂️<br/><strong>Team Trimly</strong></p>
      </div>
    `,
  })
}

export async function sendBookingCancellation(
  booking: BookingWithDetails,
  customerEmail: string,
  customerName: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Booking Cancelled — ${booking.salon.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Booking Cancelled</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking has been cancelled as requested.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Salon:</strong> ${booking.salon.name}</p>
          <p><strong>Service:</strong> ${booking.service.name}</p>
          <p><strong>Date:</strong> ${formatDate(booking.slot.date)}</p>
          <p><strong>Time:</strong> ${formatTime(booking.slot.start_time)}</p>
        </div>
        <p>We hope to see you again soon.<br/><strong>Team Trimly</strong></p>
      </div>
    `,
  })
}
