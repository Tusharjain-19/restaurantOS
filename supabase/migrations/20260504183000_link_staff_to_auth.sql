-- ============================================================
-- 1. Link Supabase Auth Users to Staff
-- ============================================================
-- Add a column to store the Supabase Auth UUID in the staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);

-- ============================================================
-- 2. Update Row Level Security (RLS)
-- ============================================================
-- Update the 'View staff' policy to allow users to see their own profile or any staff in their restaurant
DROP POLICY IF EXISTS "View staff" ON public.staff;
CREATE POLICY "View staff" ON public.staff FOR SELECT TO authenticated
  USING (
    restaurant_id = public.get_user_restaurant_id() 
    OR user_id = auth.uid()
  );

-- Update the 'Manage staff' policy
DROP POLICY IF EXISTS "Manage staff" ON public.staff;
CREATE POLICY "Manage staff" ON public.staff FOR ALL TO authenticated
  USING (
    restaurant_id = public.get_user_restaurant_id() 
    OR user_id = auth.uid()
  )
  WITH CHECK (
    restaurant_id = public.get_user_restaurant_id() 
    OR user_id = auth.uid()
  );

-- ============================================================
-- 3. (Optional) Auto-link on Sign-up
-- ============================================================
-- You can run this if you want to automatically create a staff record when a new user signs up
-- but for HQ Admins, usually you'll link an existing staff record manually.
