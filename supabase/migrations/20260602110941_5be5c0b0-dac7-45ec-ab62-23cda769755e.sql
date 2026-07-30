-- KOT add-on safety: prevent any mutation of sent rows.
-- Increases must happen by inserting a NEW pending row (add-on), not by bumping qty on a sent row.

CREATE OR REPLACE FUNCTION public.guard_sent_order_items()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.kot_status = 'sent' THEN
      -- Allow only transitions driven by kitchen workflow / status updates
      IF NEW.qty <> OLD.qty THEN
        RAISE EXCEPTION 'Cannot change qty of an already-sent KOT item. Add a new line instead.'
          USING ERRCODE = 'check_violation';
      END IF;
      IF NEW.unit_price <> OLD.unit_price THEN
        RAISE EXCEPTION 'Cannot change price of an already-sent KOT item.'
          USING ERRCODE = 'check_violation';
      END IF;
      IF NEW.item_id <> OLD.item_id OR COALESCE(NEW.variant_id::text,'') <> COALESCE(OLD.variant_id::text,'') THEN
        RAISE EXCEPTION 'Cannot change item of an already-sent KOT row.'
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.kot_status = 'sent' THEN
      RAISE EXCEPTION 'Cannot delete a sent KOT item. Use void/cancel workflow.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_sent_order_items ON public.order_items;
CREATE TRIGGER trg_guard_sent_order_items
BEFORE UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.guard_sent_order_items();