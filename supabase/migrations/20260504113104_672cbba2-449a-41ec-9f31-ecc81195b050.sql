CREATE OR REPLACE FUNCTION public.handle_order_item_qty_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.qty > OLD.qty THEN
    NEW.kot_status = 'pending';
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_item_qty_increase ON public.order_items;

CREATE TRIGGER on_order_item_qty_increase
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  WHEN (OLD.qty IS DISTINCT FROM NEW.qty)
  EXECUTE FUNCTION public.handle_order_item_qty_update();