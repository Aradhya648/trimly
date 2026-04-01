# Trimly

**Smart Salon Booking Platform** — A full-stack Next.js application enabling salon owners to manage services, staff, and availability, while customers can discover salons and book appointments online.

---

## ✨ Features

- **Role-based access control**: Customer, Owner, Admin
- **Salon discovery**: Browse active salons by location
- **Service management**: Owners define services with pricing and duration
- **Staff scheduling**: Manage staff and their availability slots
- **Online booking**: Customers book appointments with automatic slot reservation
- **Real-time availability**: Dynamic slot generation based on staff schedules
- **Secure payments**: Integrated payment status tracking (INR)
- **Email notifications**: Automated booking confirmations/cancellations via Resend
- **Admin dashboard**: Oversight of all salons and bookings
- **Mobile-friendly UI**: Built with shadcn/ui and Tailwind CSS

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (phone + OTP) |
| **Email** | Resend |
| **Deployment** | Vercel-ready (`vercel.json`) |
| **Utils** | date-fns, clsx, tailwind-merge |

---

## 🏗 Architecture

### High-level components

```
┌─────────────────┐    ┌──────────────────────┐
│   Next.js App   │◄──►│   Supabase (DB + Auth)│
│   (App Router)  │    │   - profiles         │
│                 │    │   - salons           │
│ • (customer)    │    │   - services         │
│ • (owner)       │    │   - staff            │
│ • (admin)       │    │   - availability_slots│
│ • auth          │    │   - bookings         │
└─────────────────┘    └──────────────────────┘
```

### Route groups & access

- `/(customer)`: Public salon browsing, booking creation
- `/(owner)`: Owner-only dashboard, manage own salons/services/staff/availability
- `/(admin)`: Admin-only oversight of all salons/bookings
- `/auth`: Login (OTP) and profile verification

Middleware (`src/middleware.ts`) enforces:
- Public routes: `/salons`, `/auth`, `/api/salons`, etc.
- Protected routes redirect to login if unauthenticated
- Role checks: `/owner/*` → requires `role = 'owner'`; `/admin/*` → `role = 'admin'`

### Database schema (key tables)

- **profiles** – extends `auth.users` with `full_name`, `phone`, `role`
- **salons** – name, description, location, contact, owner reference
- **services** – per-salon offerings with `duration_mins`, `price`
- **staff** – salon employees; linked to services via `staff_services`
- **availability_slots** – per-staff time slots (`date`, `start_time`, `end_time`, `is_booked`)
- **bookings** – customer bookings linking salon, staff, service, slot; with `status` and `payment_status`
- **notification_log** – audit of confirmation/cancellation/reminder emails

RLS (Row Level Security) policies ensure:
- Users see only what their role permits
- Owners can manage only their own salons
- Admins have full read access

Triggers:
- Auto-create profile on signup
- Auto-mark slot as booked on booking creation
- Auto-free slot on booking cancellation

### API routes (REST-ish)

All under `/app/api/`:
- `GET /api/salons` – list active salons
- `GET /api/salons/[id]` – salon details + services + staff
- `POST /api/salons/[id]/availability` – generate slots for a date range
- `GET /api/bookings` – customer's own bookings
- `POST /api/bookings` – create booking ( reserves slot )
- `GET/PATCH /api/bookings/[id]` – view or cancel
- Owner routes: `/api/owner/salons`, `/api/owner/salons/[id]/services`, etc.
- Admin routes: `/api/admin/salons`, `/api/admin/bookings`
- Auth: `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/profile`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Resend account (optional, for emails)

### Environment setup

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` (optional)

### Database setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. (Optional) seed data via `GET /api/seed` once app is running (dev only)

### Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Build & production

```bash
npm run build
npm start
```

Deploy to Vercel (or any Node host) with environment variables set.

---

## 📁 Project Structure

```
trimly/
├── app/
│   ├── (admin)/         # admin-only pages
│   ├── (owner)/         # owner-only pages
│   ├── (customer)/      # customer-facing pages
│   ├── auth/            # login, verify
│   ├── api/             # route handlers
│   ├── globals.css      # global styles + Tailwind
│   └── layout.tsx       # root layout
├── components/
│   ├── booking/         # booking-specific UI
│   ├── owner/           # owner dashboard UI
│   ├── salon/           # salon cards, details
│   ├── shared/          # reusable bits
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # client & server Supabase helpers
│   ├── utils.ts         # cn, formatCurrency, formatDate, etc.
│   └── validations/     # Zod schemas (if present)
├── services/            # business logic helpers (if present)
├── types/               # TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts        # auth + RBAC middleware
├── next.config.ts       # Next.js config (images remote patterns)
├── tsconfig.json        # TypeScript config
├── components.json      # shadcn/ui config
└── package.json
```

---

## 🔐 Authentication & Authorization

- Phone-based OTP login via Supabase Auth
- On signup, user selects role (`customer` by default)
- `profiles.role` determines access:
  - **Customer**: can browse salons and create bookings
  - **Owner**: can manage own salons, services, staff, availability; view own bookings
  - **Admin**: can view all salons and bookings (no write assumed)
- Middleware protects routes and redirects unauthorized users

---

## 📧 Notifications

Uses Resend for transactional emails:
- Booking confirmation
- Cancellation notice
- (Potential) reminders before appointment

Email templates are sent from API routes in `/app/api/*`. Configure `RESEND_API_KEY` and `RESEND_EMAIL_FROM` in `.env.local`.

---

## 🧪 Testing & Linting

```bash
npm run lint   # ESLint with Next.js config
# Unit/integration tests not yet added
```

---

## 🧱 Future Improvements

- Payment gateway integration (Razorpay/Stripe) instead of status-only
- Real-time availability updates with Supabase Realtime
- Owner mobile app (React Native)
- Review & rating system for salons
- Multi-city expansion with better geo-search
- Calendar sync (Google Calendar) for staff
- Automated reminder SMS/email via Twilio
- Owner analytics dashboard
- Waitlist handling
- Staff shift management

---

## 📄 License

Private project — all rights reserved.

---

## 🙋 Support

For issues, feature requests, or collaboration, contact the maintainer via GitHub: [Aradhya648/trimly](https://github.com/Aradhya648/trimly).
