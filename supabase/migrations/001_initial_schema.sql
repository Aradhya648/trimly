-- ============================================================
-- TRIMLY — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- for lat/lng geo queries (optional)

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('customer', 'owner', 'admin');
create type booking_status as enum ('confirmed', 'cancelled', 'completed');
create type payment_status as enum ('unpaid', 'paid', 'refunded');
create type notification_type as enum ('confirmation', 'cancellation', 'reminder');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  full_name text not null default '',
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, phone, full_name, role)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SALONS
-- ============================================================
create table salons (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  city text not null,
  area text not null,
  address text not null,
  lat double precision,
  lng double precision,
  phone text,
  email text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table salons enable row level security;

create policy "Anyone can view active salons"
  on salons for select using (is_active = true);

create policy "Owners can view own salons"
  on salons for select using (auth.uid() = owner_id);

create policy "Owners can insert salons"
  on salons for insert with check (auth.uid() = owner_id);

create policy "Owners can update own salons"
  on salons for update using (auth.uid() = owner_id);

create policy "Admins can view all salons"
  on salons for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all salons"
  on salons for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- STAFF
-- ============================================================
create table staff (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references salons(id) on delete cascade,
  name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table staff enable row level security;

create policy "Anyone can view active staff"
  on staff for select using (is_active = true);

create policy "Owners can manage own salon staff"
  on staff for all using (
    exists (select 1 from salons where id = staff.salon_id and owner_id = auth.uid())
  );

-- ============================================================
-- SERVICES
-- ============================================================
create table services (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references salons(id) on delete cascade,
  name text not null,
  description text,
  duration_mins integer not null default 30,
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "Anyone can view active services"
  on services for select using (is_active = true);

create policy "Owners can manage own salon services"
  on services for all using (
    exists (select 1 from salons where id = services.salon_id and owner_id = auth.uid())
  );

-- ============================================================
-- STAFF <-> SERVICES (many-to-many)
-- ============================================================
create table staff_services (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  unique(staff_id, service_id)
);

alter table staff_services enable row level security;

create policy "Anyone can view staff services"
  on staff_services for select using (true);

create policy "Owners can manage staff services"
  on staff_services for all using (
    exists (
      select 1 from staff s
      join salons on salons.id = s.salon_id
      where s.id = staff_services.staff_id and salons.owner_id = auth.uid()
    )
  );

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================
create table availability_slots (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references staff(id) on delete cascade,
  salon_id uuid not null references salons(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint no_overlap unique(staff_id, date, start_time)
);

alter table availability_slots enable row level security;

create policy "Anyone can view available slots"
  on availability_slots for select using (true);

create policy "Owners can manage own salon slots"
  on availability_slots for all using (
    exists (select 1 from salons where id = availability_slots.salon_id and owner_id = auth.uid())
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  salon_id uuid not null references salons(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  slot_id uuid not null references availability_slots(id) on delete cascade,
  status booking_status not null default 'confirmed',
  payment_status payment_status not null default 'unpaid',
  payment_amount numeric(10,2) not null default 0,
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "Customers can view own bookings"
  on bookings for select using (auth.uid() = customer_id);

create policy "Customers can create bookings"
  on bookings for insert with check (auth.uid() = customer_id);

create policy "Customers can cancel own bookings"
  on bookings for update using (auth.uid() = customer_id);

create policy "Owners can view bookings for their salons"
  on bookings for select using (
    exists (select 1 from salons where id = bookings.salon_id and owner_id = auth.uid())
  );

create policy "Owners can update bookings for their salons"
  on bookings for update using (
    exists (select 1 from salons where id = bookings.salon_id and owner_id = auth.uid())
  );

create policy "Admins can view all bookings"
  on bookings for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-mark slot as booked when booking is created
create or replace function mark_slot_booked()
returns trigger as $$
begin
  update availability_slots set is_booked = true where id = new.slot_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_booking_created
  after insert on bookings
  for each row execute procedure mark_slot_booked();

-- Auto-free slot when booking is cancelled
create or replace function free_slot_on_cancel()
returns trigger as $$
begin
  if new.status = 'cancelled' and old.status != 'cancelled' then
    update availability_slots set is_booked = false where id = new.slot_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_booking_cancelled
  after update on bookings
  for each row execute procedure free_slot_on_cancel();

-- ============================================================
-- NOTIFICATION LOG
-- ============================================================
create table notification_log (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type notification_type not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent'
);

alter table notification_log enable row level security;

create policy "Admins can view notification logs"
  on notification_log for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_salons_city on salons(city);
create index idx_salons_owner on salons(owner_id);
create index idx_staff_salon on staff(salon_id);
create index idx_services_salon on services(salon_id);
create index idx_slots_staff_date on availability_slots(staff_id, date);
create index idx_slots_salon on availability_slots(salon_id);
create index idx_bookings_customer on bookings(customer_id);
create index idx_bookings_salon on bookings(salon_id);
create index idx_bookings_slot on bookings(slot_id);
