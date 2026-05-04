
-- ============================================================
-- Migration: Add KOTs table + Sync infrastructure
-- Purpose: Enable cloud persistence so restaurant data survives
--          re-login, device switches, and browser clears.
-- ============================================================

-- 1. KOTs table (missing from original migration)
CREATE TABLE IF NOT EXISTS public.kots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  kot_number INTEGER NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  table_number TEXT,
  order_type TEXT NOT NULL DEFAULT 'Dine-In',
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'in_preparation', 'ready', 'served', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  staff_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View kots" ON public.kots FOR SELECT TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage kots" ON public.kots FOR ALL TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id())
  WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE TRIGGER update_kots_updated_at BEFORE UPDATE ON public.kots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kots;

-- 2. Staff table for cloud auth (maps to local staff)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cashier'
    CHECK (role IN ('admin', 'manager', 'captain', 'cashier', 'kitchen', 'delivery')),
  pin TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  shift TEXT DEFAULT 'full',
  salary NUMERIC(10,2),
  joining_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View staff" ON public.staff FOR SELECT TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage staff" ON public.staff FOR ALL TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id())
  WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Settings table for cloud persistence of sequences, configs, etc.
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, key)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View settings" ON public.app_settings FOR SELECT TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (restaurant_id = public.get_user_restaurant_id())
  WITH CHECK (restaurant_id = public.get_user_restaurant_id());

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_date ON public.orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_restaurant_date ON public.bills(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kots_restaurant_date ON public.kots(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 5. Trigger to auto-reset KOT status when order_item qty increases
CREATE OR REPLACE FUNCTION public.handle_order_item_qty_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qty > OLD.qty AND OLD.kot_status != 'pending' THEN
    NEW.kot_status = 'pending';
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_item_qty_increase ON public.order_items;
CREATE TRIGGER on_order_item_qty_increase
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  WHEN (OLD.qty IS DISTINCT FROM NEW.qty)
  EXECUTE FUNCTION public.handle_order_item_qty_update();
