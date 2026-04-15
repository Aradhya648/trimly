-- ============================================================
-- Migration 003: barber_status, offers, reviews, favourites,
--               business_hours + extend existing tables
-- ============================================================

-- ── 1. Extend profiles ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- ── 2. Extend salons ────────────────────────────────────────
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS open_time TIME DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS close_time TIME DEFAULT '21:00';

-- ── 3. Extend staff ─────────────────────────────────────────
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0;

-- ── 4. barber_status (real-time availability) ───────────────
CREATE TABLE IF NOT EXISTS barber_status (
  staff_id   UUID PRIMARY KEY REFERENCES staff(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'available'
               CHECK (status IN ('available','busy','break','offline')),
  queue_len  INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-insert a row when a staff member is created
CREATE OR REPLACE FUNCTION handle_new_staff()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO barber_status (staff_id) VALUES (NEW.id)
  ON CONFLICT (staff_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_staff_created ON staff;
CREATE TRIGGER on_staff_created
  AFTER INSERT ON staff
  FOR EACH ROW EXECUTE FUNCTION handle_new_staff();

-- Back-fill existing staff
INSERT INTO barber_status (staff_id)
SELECT id FROM staff
ON CONFLICT (staff_id) DO NOTHING;

-- ── 5. business_hours ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_hours (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week  INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time    TIME NOT NULL DEFAULT '09:00',
  close_time   TIME NOT NULL DEFAULT '21:00',
  is_closed    BOOLEAN DEFAULT false,
  UNIQUE (salon_id, day_of_week)
);

-- ── 6. offers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id      UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  discount_pct  INT  CHECK (discount_pct BETWEEN 1 AND 100),
  code          TEXT,
  valid_from    TIMESTAMPTZ DEFAULT now(),
  valid_until   TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 7. reviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  staff_id    UUID NOT NULL REFERENCES staff(id),
  salon_id    UUID NOT NULL REFERENCES salons(id),
  rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 8. favourite_barbers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS favourite_barbers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (customer_id, staff_id)
);

-- ══════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════

-- barber_status: public read, owner write
ALTER TABLE barber_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "barber_status_public_read" ON barber_status;
CREATE POLICY "barber_status_public_read" ON barber_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "barber_status_owner_write" ON barber_status;
CREATE POLICY "barber_status_owner_write" ON barber_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff s
      JOIN salons sa ON sa.id = s.salon_id
      WHERE s.id = barber_status.staff_id
        AND sa.owner_id = auth.uid()
    )
  );

-- business_hours: public read, owner write
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bh_public_read" ON business_hours;
CREATE POLICY "bh_public_read" ON business_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "bh_owner_write" ON business_hours;
CREATE POLICY "bh_owner_write" ON business_hours FOR ALL USING (
  EXISTS (
    SELECT 1 FROM salons WHERE id = business_hours.salon_id AND owner_id = auth.uid()
  )
);

-- offers: public read active, owner write
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offers_public_read" ON offers;
CREATE POLICY "offers_public_read" ON offers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "offers_owner_write" ON offers;
CREATE POLICY "offers_owner_write" ON offers FOR ALL USING (
  EXISTS (SELECT 1 FROM salons WHERE id = offers.salon_id AND owner_id = auth.uid())
);

-- reviews: public read, customer insert own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_customer_insert" ON reviews;
CREATE POLICY "reviews_customer_insert" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- favourite_barbers: customer manages own
ALTER TABLE favourite_barbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fav_own" ON favourite_barbers;
CREATE POLICY "fav_own" ON favourite_barbers FOR ALL USING (auth.uid() = customer_id);

-- ══════════════════════════════════════════════════════════
-- REALTIME (enable for barber_status so live traffic works)
-- ══════════════════════════════════════════════════════════
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'barber_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE barber_status;
  END IF;
END$$;
