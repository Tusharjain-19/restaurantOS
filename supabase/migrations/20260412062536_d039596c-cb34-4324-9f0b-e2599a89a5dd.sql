
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow delete via authenticated" ON public.licenses;
DROP POLICY IF EXISTS "Allow insert via authenticated" ON public.licenses;
DROP POLICY IF EXISTS "Allow public read access" ON public.licenses;
DROP POLICY IF EXISTS "Allow update via authenticated" ON public.licenses;

-- Create permissive policies for both anon and authenticated
CREATE POLICY "Allow public read" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.licenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.licenses FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.licenses FOR DELETE USING (true);
