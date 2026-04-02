-- Fix infinite recursion in admin RLS policies
-- Creates a security definer function to safely check if the current user is an admin
-- Then updates admin policies to use this function instead of direct subqueries.

CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS boolean AS $$
DECLARE user_role user_role;
BEGIN
 SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
 RETURN COALESCE(user_role = 'admin', false);
EXCEPTION WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all salons" ON salons;
DROP POLICY IF EXISTS "Admins can update all salons" ON salons;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view notification logs" ON notification_log;

-- Recreate using auth_is_admin()
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can view all salons"
  ON salons FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can update all salons"
  ON salons FOR UPDATE USING (auth_is_admin());

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can view notification logs"
  ON notification_log FOR SELECT USING (auth_is_admin());
