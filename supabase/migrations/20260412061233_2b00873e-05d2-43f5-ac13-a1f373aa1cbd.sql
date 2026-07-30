
CREATE TABLE public.licenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key text NOT NULL UNIQUE,
  restaurant_name text NOT NULL,
  admin_username text NOT NULL,
  admin_password text NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Allow insert via authenticated" ON public.licenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update via authenticated" ON public.licenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete via authenticated" ON public.licenses FOR DELETE TO authenticated USING (true);
