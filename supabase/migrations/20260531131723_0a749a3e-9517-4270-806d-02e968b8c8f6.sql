
-- ════════════ HQ TABLES ════════════
CREATE TABLE IF NOT EXISTS public.hq_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_admins TO authenticated;
GRANT ALL ON public.hq_admins TO service_role;
ALTER TABLE public.hq_admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.restaurant_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_key TEXT UNIQUE NOT NULL,
  restaurant_id UUID,
  is_active BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'starter',
  max_staff INT DEFAULT 10,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.hq_admins(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_activations TO authenticated;
GRANT ALL ON public.restaurant_activations TO service_role;
ALTER TABLE public.restaurant_activations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.kot_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES public.tables(id),
  table_number TEXT,
  batch_number INT NOT NULL,
  kot_number TEXT NOT NULL,
  sent_by UUID REFERENCES public.staff(id),
  sent_by_name TEXT,
  item_count INT DEFAULT 0,
  is_addon BOOLEAN DEFAULT FALSE,
  items_snapshot JSONB,
  is_printed BOOLEAN DEFAULT FALSE,
  printed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kot_batches TO authenticated;
GRANT ALL ON public.kot_batches TO service_role;
CREATE INDEX IF NOT EXISTS idx_kot_batches_order ON public.kot_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_kot_batches_restaurant ON public.kot_batches(restaurant_id);
ALTER TABLE public.kot_batches ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.realtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  triggered_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.realtime_events TO authenticated;
GRANT ALL ON public.realtime_events TO service_role;
CREATE INDEX IF NOT EXISTS idx_events_restaurant ON public.realtime_events(restaurant_id, created_at DESC);
ALTER TABLE public.realtime_events ENABLE ROW LEVEL SECURITY;

-- ════════════ ADD COLUMNS TO EXISTING TABLES ════════════
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS activation_key TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#E23744',
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='staff_restaurant_staff_id_unique') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_restaurant_staff_id_unique UNIQUE (restaurant_id, staff_id);
  END IF;
END $$;

ALTER TABLE public.floors
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS current_order_id UUID;

ALTER TABLE public.menu_categories
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS emoji TEXT;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
UPDATE public.menu_items SET base_price = price WHERE base_price IS NULL AND price IS NOT NULL;

ALTER TABLE public.menu_variants
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS floor_id UUID REFERENCES public.floors(id),
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id),
  ADD COLUMN IF NOT EXISTS item_name TEXT,
  ADD COLUMN IF NOT EXISTS variant_name TEXT,
  ADD COLUMN IF NOT EXISTS kot_batch INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kot_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES public.staff(id);
-- Backfill restaurant_id on order_items from parent order
UPDATE public.order_items oi SET restaurant_id = o.restaurant_id
FROM public.orders o WHERE oi.order_id = o.id AND oi.restaurant_id IS NULL;
-- Backfill item_name from menu_items
UPDATE public.order_items oi SET item_name = mi.name
FROM public.menu_items mi WHERE oi.item_id = mi.id AND oi.item_name IS NULL;

ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.bill_payments
  ADD COLUMN IF NOT EXISTS reference TEXT;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ════════════ SECURITY DEFINER HELPERS ════════════
CREATE OR REPLACE FUNCTION public.current_staff_restaurant_ids()
RETURNS SETOF UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT restaurant_id FROM public.staff WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_hq_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hq_admins h
    JOIN auth.users u ON u.email = h.email
    WHERE u.id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_staff_role(_restaurant_id UUID)
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::text FROM public.staff
  WHERE user_id = auth.uid() AND restaurant_id = _restaurant_id LIMIT 1;
$$;

-- ════════════ RLS POLICIES FOR NEW TABLES ════════════
DROP POLICY IF EXISTS "HQ view self" ON public.hq_admins;
CREATE POLICY "HQ view self" ON public.hq_admins FOR SELECT TO authenticated USING (public.is_hq_admin());

DROP POLICY IF EXISTS "HQ manage activations" ON public.restaurant_activations;
CREATE POLICY "HQ manage activations" ON public.restaurant_activations FOR ALL TO authenticated
  USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

DROP POLICY IF EXISTS "Tenant read kot_batches" ON public.kot_batches;
CREATE POLICY "Tenant read kot_batches" ON public.kot_batches FOR SELECT TO authenticated
  USING (restaurant_id IN (SELECT public.current_staff_restaurant_ids()));
DROP POLICY IF EXISTS "Tenant write kot_batches" ON public.kot_batches;
CREATE POLICY "Tenant write kot_batches" ON public.kot_batches FOR ALL TO authenticated
  USING (restaurant_id IN (SELECT public.current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id IN (SELECT public.current_staff_restaurant_ids()));

DROP POLICY IF EXISTS "Tenant read events" ON public.realtime_events;
CREATE POLICY "Tenant read events" ON public.realtime_events FOR SELECT TO authenticated
  USING (restaurant_id IN (SELECT public.current_staff_restaurant_ids()));
DROP POLICY IF EXISTS "Tenant write events" ON public.realtime_events;
CREATE POLICY "Tenant write events" ON public.realtime_events FOR INSERT TO authenticated
  WITH CHECK (restaurant_id IN (SELECT public.current_staff_restaurant_ids()));

-- ════════════ REALTIME PUBLICATION ════════════
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.kot_batches;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
