
-- Helper: send_kot RPC for the Waiter app
CREATE OR REPLACE FUNCTION public.send_kot(
  p_order_id      UUID,
  p_waiter_id     UUID,
  p_restaurant_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_number INT;
  v_kot_number   TEXT;
  v_item_count   INT;
  v_is_addon     BOOLEAN;
  v_today        TEXT;
  v_daily_count  INT;
  v_table_id     UUID;
  v_table_number TEXT;
  v_waiter_name  TEXT;
  v_items_snap   JSONB;
  v_kot_batch_id UUID;
BEGIN
  SELECT COUNT(*) INTO v_item_count
  FROM order_items
  WHERE order_id = p_order_id AND kot_status = 'pending';

  IF v_item_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending items to send');
  END IF;

  SELECT COALESCE(MAX(batch_number), 0) + 1 INTO v_batch_number
  FROM kot_batches WHERE order_id = p_order_id;

  v_is_addon := v_batch_number > 1;

  v_today := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO v_daily_count
  FROM kot_batches
  WHERE restaurant_id = p_restaurant_id
    AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date;

  v_kot_number := 'KOT-' || v_today || '-' || LPAD(v_daily_count::TEXT, 3, '0');

  SELECT o.table_id, t.number, COALESCE(s.name, p.name)
  INTO v_table_id, v_table_number, v_waiter_name
  FROM orders o
  LEFT JOIN tables t ON t.id = o.table_id
  LEFT JOIN staff s ON s.id = p_waiter_id
  LEFT JOIN profiles p ON p.id = p_waiter_id
  WHERE o.id = p_order_id;

  SELECT jsonb_agg(jsonb_build_object(
    'item_name', oi.item_name,
    'variant_name', oi.variant_name,
    'qty', oi.qty,
    'special_instructions', oi.special_instructions,
    'item_type', mi.item_type
  ))
  INTO v_items_snap
  FROM order_items oi
  LEFT JOIN menu_items mi ON mi.id = oi.item_id
  WHERE oi.order_id = p_order_id AND oi.kot_status = 'pending';

  INSERT INTO kot_batches (
    restaurant_id, order_id, table_id, table_number,
    batch_number, kot_number, sent_by, sent_by_name,
    item_count, is_addon, items_snapshot
  ) VALUES (
    p_restaurant_id, p_order_id, v_table_id, v_table_number,
    v_batch_number, v_kot_number, p_waiter_id, v_waiter_name,
    v_item_count, v_is_addon, v_items_snap
  ) RETURNING id INTO v_kot_batch_id;

  UPDATE order_items
  SET kot_status  = 'sent',
      kot_batch   = v_batch_number,
      kot_sent_at = NOW(),
      updated_at  = NOW()
  WHERE order_id = p_order_id AND kot_status = 'pending';

  UPDATE orders SET updated_at = NOW() WHERE id = p_order_id;

  INSERT INTO realtime_events (restaurant_id, event_type, payload, triggered_by)
  VALUES (
    p_restaurant_id, 'kot_sent',
    jsonb_build_object(
      'order_id', p_order_id,
      'table_id', v_table_id,
      'table_number', v_table_number,
      'kot_batch_id', v_kot_batch_id,
      'kot_number', v_kot_number,
      'batch_number', v_batch_number,
      'is_addon', v_is_addon,
      'item_count', v_item_count,
      'waiter_name', v_waiter_name
    ),
    p_waiter_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'kot_number', v_kot_number,
    'batch_number', v_batch_number,
    'is_addon', v_is_addon,
    'item_count', v_item_count,
    'kot_batch_id', v_kot_batch_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_kot(UUID, UUID, UUID) TO authenticated;

-- Speed up pending-items scan
CREATE INDEX IF NOT EXISTS idx_order_items_order_kot_status
  ON public.order_items(order_id, kot_status);

CREATE INDEX IF NOT EXISTS idx_kot_batches_restaurant_sent_at
  ON public.kot_batches(restaurant_id, sent_at);
