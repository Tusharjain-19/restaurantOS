
DROP POLICY "Create restaurant" ON public.restaurants;
CREATE POLICY "Create restaurant" ON public.restaurants FOR INSERT TO authenticated
WITH CHECK (public.get_user_restaurant_id() IS NULL);
