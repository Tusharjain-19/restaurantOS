
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'captain', 'cashier', 'kitchen', 'delivery');
CREATE TYPE public.order_status AS ENUM ('pending', 'active', 'kot_sent', 'billed', 'paid', 'cancelled');
CREATE TYPE public.kot_status AS ENUM ('pending', 'sent', 'in_prep', 'ready', 'served');
CREATE TYPE public.bill_status AS ENUM ('draft', 'settled', 'void');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'dirty', 'blocked');
CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'seated', 'no_show', 'cancelled');
CREATE TYPE public.po_status AS ENUM ('draft', 'sent', 'received', 'invoiced');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- restaurants
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, logo_url TEXT, type TEXT DEFAULT 'QSR',
  phone TEXT, email TEXT, website TEXT, instagram TEXT, facebook TEXT,
  address_1 TEXT, address_2 TEXT, city TEXT, state TEXT, pin TEXT, country TEXT DEFAULT 'India',
  gstin TEXT, fssai TEXT, pan TEXT, onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  email TEXT, name TEXT, role app_role NOT NULL DEFAULT 'cashier',
  avatar_url TEXT, pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- floors
CREATE TABLE public.floors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;

-- tables
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  number TEXT NOT NULL, capacity INT DEFAULT 4, shape TEXT DEFAULT 'square',
  status table_status DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- menu_categories
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, type TEXT DEFAULT 'both', display_order INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- menu_items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, price NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_type TEXT DEFAULT 'veg', image_url TEXT, is_available BOOLEAN DEFAULT TRUE,
  hsn_code TEXT, tax_rate NUMERIC(5,2) DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- menu_variants
CREATE TABLE public.menu_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, price_modifier NUMERIC(10,2) DEFAULT 0, modifier_type TEXT DEFAULT 'add',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_variants ENABLE ROW LEVEL SECURITY;

-- tax_config
CREATE TABLE public.tax_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
  service_charge_enabled BOOLEAN DEFAULT FALSE, service_charge_pct NUMERIC(5,2) DEFAULT 5,
  packaging_charge NUMERIC(10,2) DEFAULT 0, round_off TEXT DEFAULT 'nearest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_config ENABLE ROW LEVEL SECURITY;

-- printers
CREATE TABLE public.printers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, type TEXT DEFAULT 'bill', connection TEXT DEFAULT 'usb',
  ip_address TEXT, paper_width TEXT DEFAULT '80mm', is_default BOOLEAN DEFAULT FALSE,
  has_cash_drawer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

-- orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  order_type TEXT DEFAULT 'dine_in', status order_status DEFAULT 'pending',
  waiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_count INT DEFAULT 1, token_number INT,
  customer_name TEXT, customer_phone TEXT, customer_address TEXT,
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- order_items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.menu_variants(id) ON DELETE SET NULL,
  qty INT NOT NULL DEFAULT 1, unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  special_instructions TEXT, kot_status kot_status DEFAULT 'pending',
  kot_number INT, is_addon BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- bills
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  bill_number TEXT, bill_type TEXT DEFAULT 'standard',
  subtotal NUMERIC(10,2) DEFAULT 0, discount_pct NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0, discount_reason TEXT,
  taxable_amount NUMERIC(10,2) DEFAULT 0, cgst NUMERIC(10,2) DEFAULT 0,
  sgst NUMERIC(10,2) DEFAULT 0, service_charge NUMERIC(10,2) DEFAULT 0,
  packaging_charge NUMERIC(10,2) DEFAULT 0, round_off NUMERIC(10,2) DEFAULT 0,
  grand_total NUMERIC(10,2) DEFAULT 0, status bill_status DEFAULT 'draft',
  settled_at TIMESTAMPTZ, cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- bill_payments
CREATE TABLE public.bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'cash', amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;

-- vendors (before ingredients)
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, contact_person TEXT, phone TEXT, email TEXT, gstin TEXT,
  payment_terms TEXT DEFAULT 'COD', bank_details JSONB, categories_supplied TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- ingredients
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT DEFAULT 'other', unit TEXT DEFAULT 'kg',
  min_level NUMERIC(10,2) DEFAULT 0, current_stock NUMERIC(10,2) DEFAULT 0,
  cost_per_unit NUMERIC(10,2) DEFAULT 0,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  storage_location TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- purchase_orders
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  status po_status DEFAULT 'draft', expected_date DATE, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- po_items
CREATE TABLE public.po_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  qty_ordered NUMERIC(10,2) DEFAULT 0, qty_received NUMERIC(10,2) DEFAULT 0,
  unit_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;

-- wastage_log
CREATE TABLE public.wastage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'ingredient', item_id UUID NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 0, unit TEXT DEFAULT 'kg',
  reason TEXT DEFAULT 'spoiled', cost NUMERIC(10,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wastage_log ENABLE ROW LEVEL SECURITY;

-- reservations
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL, customer_phone TEXT,
  date DATE NOT NULL, time TIME NOT NULL, covers INT DEFAULT 2,
  special_requests TEXT, status reservation_status DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- stock_adjustments
CREATE TABLE public.stock_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  qty_change NUMERIC(10,2) NOT NULL DEFAULT 0, reason TEXT,
  adjusted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

-- Updated_at triggers
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON public.floors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tax_config_updated_at BEFORE UPDATE ON public.tax_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON public.printers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT restaurant_id FROM public.profiles WHERE user_id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM public.profiles WHERE user_id = auth.uid() $$;

-- RLS Policies
CREATE POLICY "View own restaurant" ON public.restaurants FOR SELECT TO authenticated USING (id = public.get_user_restaurant_id());
CREATE POLICY "Update own restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (id = public.get_user_restaurant_id());
CREATE POLICY "Create restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "View profiles" ON public.profiles FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id() OR user_id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "View floors" ON public.floors FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage floors" ON public.floors FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View tables" ON public.tables FOR SELECT TO authenticated USING (floor_id IN (SELECT id FROM public.floors WHERE restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage tables" ON public.tables FOR ALL TO authenticated USING (floor_id IN (SELECT id FROM public.floors WHERE restaurant_id = public.get_user_restaurant_id())) WITH CHECK (floor_id IN (SELECT id FROM public.floors WHERE restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View menu_categories" ON public.menu_categories FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage menu_categories" ON public.menu_categories FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View menu_items" ON public.menu_items FOR SELECT TO authenticated USING (category_id IN (SELECT id FROM public.menu_categories WHERE restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage menu_items" ON public.menu_items FOR ALL TO authenticated USING (category_id IN (SELECT id FROM public.menu_categories WHERE restaurant_id = public.get_user_restaurant_id())) WITH CHECK (category_id IN (SELECT id FROM public.menu_categories WHERE restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View variants" ON public.menu_variants FOR SELECT TO authenticated USING (item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage variants" ON public.menu_variants FOR ALL TO authenticated USING (item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id())) WITH CHECK (item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View tax_config" ON public.tax_config FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage tax_config" ON public.tax_config FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View printers" ON public.printers FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage printers" ON public.printers FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View orders" ON public.orders FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage orders" ON public.orders FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View order_items" ON public.order_items FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM public.orders WHERE restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage order_items" ON public.order_items FOR ALL TO authenticated USING (order_id IN (SELECT id FROM public.orders WHERE restaurant_id = public.get_user_restaurant_id())) WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View bills" ON public.bills FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage bills" ON public.bills FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View bill_payments" ON public.bill_payments FOR SELECT TO authenticated USING (bill_id IN (SELECT id FROM public.bills WHERE restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage bill_payments" ON public.bill_payments FOR ALL TO authenticated USING (bill_id IN (SELECT id FROM public.bills WHERE restaurant_id = public.get_user_restaurant_id())) WITH CHECK (bill_id IN (SELECT id FROM public.bills WHERE restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View vendors" ON public.vendors FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage vendors" ON public.vendors FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View ingredients" ON public.ingredients FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage ingredients" ON public.ingredients FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View recipes" ON public.recipes FOR SELECT TO authenticated USING (menu_item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage recipes" ON public.recipes FOR ALL TO authenticated USING (menu_item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id())) WITH CHECK (menu_item_id IN (SELECT mi.id FROM public.menu_items mi JOIN public.menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View purchase_orders" ON public.purchase_orders FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage purchase_orders" ON public.purchase_orders FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View po_items" ON public.po_items FOR SELECT TO authenticated USING (po_id IN (SELECT id FROM public.purchase_orders WHERE restaurant_id = public.get_user_restaurant_id()));
CREATE POLICY "Manage po_items" ON public.po_items FOR ALL TO authenticated USING (po_id IN (SELECT id FROM public.purchase_orders WHERE restaurant_id = public.get_user_restaurant_id())) WITH CHECK (po_id IN (SELECT id FROM public.purchase_orders WHERE restaurant_id = public.get_user_restaurant_id()));

CREATE POLICY "View wastage" ON public.wastage_log FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage wastage" ON public.wastage_log FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View reservations" ON public.reservations FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage reservations" ON public.reservations FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

CREATE POLICY "View stock_adjustments" ON public.stock_adjustments FOR SELECT TO authenticated USING (restaurant_id = public.get_user_restaurant_id());
CREATE POLICY "Manage stock_adjustments" ON public.stock_adjustments FOR ALL TO authenticated USING (restaurant_id = public.get_user_restaurant_id()) WITH CHECK (restaurant_id = public.get_user_restaurant_id());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
