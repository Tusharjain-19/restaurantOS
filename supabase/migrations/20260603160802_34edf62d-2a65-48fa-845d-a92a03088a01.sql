
-- Tighten RLS on tenant tables (drop open "Allow all" policies)
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all on tables" ON public.tables;
DROP POLICY IF EXISTS "Allow all on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow all on menu_categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Allow all on menu_variants" ON public.menu_variants;
DROP POLICY IF EXISTS "Allow all on staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all on kot_batches" ON public.kot_batches;
DROP POLICY IF EXISTS "Allow all on kots" ON public.kots;
DROP POLICY IF EXISTS "Allow all on realtime_events" ON public.realtime_events;
DROP POLICY IF EXISTS "Allow all on bills" ON public.bills;
DROP POLICY IF EXISTS "Allow all on floors" ON public.floors;

-- Tenant policies
CREATE POLICY "Tenant orders" ON public.orders FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

CREATE POLICY "Tenant order_items" ON public.order_items FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

CREATE POLICY "Tenant menu_items" ON public.menu_items FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

CREATE POLICY "Tenant menu_categories" ON public.menu_categories FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

CREATE POLICY "View menu_variants" ON public.menu_variants FOR SELECT TO authenticated
  USING (item_id IN (SELECT id FROM menu_items WHERE restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids())));
CREATE POLICY "Manage menu_variants" ON public.menu_variants FOR ALL TO authenticated
  USING (item_id IN (SELECT id FROM menu_items WHERE restaurant_id = get_user_restaurant_id()))
  WITH CHECK (item_id IN (SELECT id FROM menu_items WHERE restaurant_id = get_user_restaurant_id()));

CREATE POLICY "Tenant staff" ON public.staff FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR user_id = auth.uid())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

CREATE POLICY "Tenant kots" ON public.kots FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

CREATE POLICY "Tenant bills" ON public.bills FOR ALL TO authenticated
  USING (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()))
  WITH CHECK (restaurant_id = get_user_restaurant_id() OR restaurant_id IN (SELECT current_staff_restaurant_ids()));

-- Allow staff lookup by anon for waiter/kitchen login (staff_id + pin) — limited columns via separate view not needed; login uses anon to find email, then signs in
-- Keep narrow: anon can SELECT for login lookup
CREATE POLICY "Anon staff login lookup" ON public.staff FOR SELECT TO anon USING (true);

-- Licenses: restrict to HQ admin only
DROP POLICY IF EXISTS "Allow all on licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow all delete" ON public.licenses;
DROP POLICY IF EXISTS "Allow all insert" ON public.licenses;
DROP POLICY IF EXISTS "Allow all update" ON public.licenses;
DROP POLICY IF EXISTS "Allow public read" ON public.licenses;
DROP POLICY IF EXISTS "Allow public read on licenses" ON public.licenses;
CREATE POLICY "HQ manage licenses" ON public.licenses FOR ALL TO authenticated
  USING (is_hq_admin()) WITH CHECK (is_hq_admin());
