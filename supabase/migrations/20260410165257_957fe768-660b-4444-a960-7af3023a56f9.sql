
-- Create customer tier enum
CREATE TYPE public.customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Create points log type enum
CREATE TYPE public.points_type AS ENUM ('earn', 'redeem', 'adjust');

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birthday DATE,
  tier customer_tier NOT NULL DEFAULT 'bronze',
  total_points INTEGER NOT NULL DEFAULT 0,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Points log table
CREATE TABLE public.points_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills(id),
  type points_type NOT NULL DEFAULT 'earn',
  points INTEGER NOT NULL DEFAULT 0,
  balance_after INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loyalty settings table
CREATE TABLE public.loyalty_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  earn_rate INTEGER NOT NULL DEFAULT 10,
  earn_per_amount INTEGER NOT NULL DEFAULT 100,
  redeem_rate NUMERIC NOT NULL DEFAULT 0.25,
  bronze_threshold INTEGER NOT NULL DEFAULT 0,
  silver_threshold INTEGER NOT NULL DEFAULT 500,
  gold_threshold INTEGER NOT NULL DEFAULT 2000,
  platinum_threshold INTEGER NOT NULL DEFAULT 5000,
  birthday_discount_pct NUMERIC DEFAULT 10,
  min_bill_for_points NUMERIC DEFAULT 0,
  points_expiry TEXT DEFAULT 'never',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "View customers" ON public.customers FOR SELECT TO authenticated
  USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Manage customers" ON public.customers FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- Points log policies
CREATE POLICY "View points_log" ON public.points_log FOR SELECT TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE restaurant_id = get_user_restaurant_id()));
CREATE POLICY "Manage points_log" ON public.points_log FOR ALL TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE restaurant_id = get_user_restaurant_id()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE restaurant_id = get_user_restaurant_id()));

-- Loyalty settings policies
CREATE POLICY "View loyalty_settings" ON public.loyalty_settings FOR SELECT TO authenticated
  USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Manage loyalty_settings" ON public.loyalty_settings FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_settings_updated_at BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for phone lookup
CREATE INDEX idx_customers_phone ON public.customers(restaurant_id, phone);
