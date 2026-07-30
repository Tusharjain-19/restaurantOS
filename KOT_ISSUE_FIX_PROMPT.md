# 🔥 KOT Add-On Issue — Complete Fix Prompt
## For Antigravity / Lovable / Any AI Builder
### The Problem · The Root Cause · The Complete Solution · All Edge Cases

---

> **WHAT THIS FILE IS:**
> A single comprehensive prompt that solves the KOT add-on bug completely.
> Paste the sections marked **[PASTE INTO BUILDER]** directly into your AI builder.
> Everything else is explanation for you to understand the fix.

---

# PART 1 — UNDERSTANDING THE BUG

---

## The Exact Scenario That Breaks

```
2:00 PM — Table 1 places order:
  Waiter adds:  2× Paneer Tikka
                1× Crispy Corn
  Waiter taps [Send KOT] → KOT #1 sent to kitchen ✓
  Kitchen gets: 2× Paneer Tikka + 1× Crispy Corn

2:30 PM — Same table, same customer:
  Customer says: "One more Crispy Corn please"
  Waiter adds Crispy Corn to the order

THE BUG HAPPENS HERE ↓
```

## What Buggy Code Does (and why it breaks KOT):

Most naive implementations do this when adding an item that already exists in the cart:

```javascript
// WRONG — This is what breaks everything
if (existingItem) {
  // Increases qty of the ALREADY SENT item
  UPDATE order_items SET qty = qty + 1 WHERE id = existingItem.id
  // Now the item has qty=2, kot_batch=1, kot_status='sent'
}
```

**Result:**
- The extra Crispy Corn has `kot_status = 'sent'` (already)
- No new "pending" item exists
- [Send KOT] button checks for `pending` items → finds none → stays disabled
- Kitchen never knows about the extra item
- Bill IS updated (shows 2× Crispy Corn) but kitchen only made 1
- **Customer gets wrong order. Kitchen is confused.**

## Why This Feels Right But Is Wrong

The developer thinks: "The user wants 1 more Crispy Corn. I'll just increment the qty."

But `qty` is NOT a simple counter after a KOT is sent. Once a row has `kot_status = 'sent'`, that row represents a **committed kitchen instruction**. You cannot retroactively change it — the kitchen already has that instruction on paper.

The extra Crispy Corn is a **new kitchen instruction** — and must be tracked separately.

---

# PART 2 — THE CORRECT MENTAL MODEL

---

Think of `order_items` rows like **receipts**, not **live counters**.

```
BAD MENTAL MODEL:
  "The order has 2 Crispy Corn"
  → 1 row, qty=2

CORRECT MENTAL MODEL:
  "The kitchen was told to make 1 Crispy Corn at 2:00 PM"
  "The kitchen was told to make 1 MORE Crispy Corn at 2:30 PM"
  → 2 rows, each qty=1, different kot_batch numbers
```

This is exactly how real restaurant KOT systems work:
- First KOT (paper slip 1): 2× Paneer Tikka, 1× Crispy Corn
- Add-On KOT (paper slip 2): 1× Crispy Corn

Two slips. Two events. Two rows in the database.

---

# PART 3 — THE DATABASE FIX

---

## [PASTE INTO BUILDER — DATABASE CHANGES]

```
Fix the order_items table and KOT system in our restaurant app.

The core issue: when a waiter adds an item to an order that already has that item 
sent to the kitchen (kot_status = 'sent'), the system should NEVER modify the 
existing row. It must ALWAYS insert a new row with kot_status='pending' and 
kot_batch=0.

Make these database changes:

1. Ensure order_items table has these columns (add if missing):

   kot_status  TEXT DEFAULT 'pending'
     -- Values: pending | sent | preparing | ready | served | cancelled
   
   kot_batch   INT DEFAULT 0  
     -- 0 = not sent yet (pending)
     -- 1 = sent in first KOT
     -- 2 = sent in second KOT (add-on)
     -- N = sent in Nth KOT
   
   kot_sent_at TIMESTAMPTZ  
     -- when this item was sent to kitchen (null if pending)

2. Create the kot_batches table (tracks every KOT send event):

CREATE TABLE IF NOT EXISTS kot_batches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL,
  order_id       UUID NOT NULL,
  table_id       UUID,
  table_number   TEXT,
  batch_number   INT NOT NULL,     -- 1=first KOT, 2=second, etc.
  kot_number     TEXT NOT NULL,    -- KOT-20260408-047
  sent_by        UUID,             -- staff id
  sent_by_name   TEXT,
  item_count     INT DEFAULT 0,
  is_addon       BOOLEAN DEFAULT FALSE,  -- TRUE when batch_number > 1
  items_snapshot JSONB,            -- copy of items for printing
  is_printed     BOOLEAN DEFAULT FALSE,
  printed_at     TIMESTAMPTZ,
  sent_at        TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

3. Create this Supabase RPC function (call it instead of manual updates):

CREATE OR REPLACE FUNCTION send_kot(
  p_order_id      UUID,
  p_waiter_id     UUID,
  p_restaurant_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_batch_number INT;
  v_kot_number   TEXT;
  v_item_count   INT;
  v_is_addon     BOOLEAN;
  v_daily_count  INT;
  v_table_id     UUID;
  v_table_number TEXT;
  v_waiter_name  TEXT;
  v_items_snap   JSONB;
  v_kot_batch_id UUID;
BEGIN
  -- Check pending item count
  SELECT COUNT(*) INTO v_item_count
  FROM order_items
  WHERE order_id = p_order_id AND kot_status = 'pending';

  IF v_item_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending items');
  END IF;

  -- Determine batch number for this order
  SELECT COALESCE(MAX(batch_number), 0) + 1 INTO v_batch_number
  FROM kot_batches WHERE order_id = p_order_id;

  v_is_addon := v_batch_number > 1;

  -- Generate unique KOT number for today
  SELECT COUNT(*) + 1 INTO v_daily_count
  FROM kot_batches
  WHERE restaurant_id = p_restaurant_id AND sent_at::DATE = CURRENT_DATE;

  v_kot_number := 'KOT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(v_daily_count::TEXT, 3, '0');

  -- Get table and waiter info
  SELECT o.table_id, t.number, s.name
  INTO v_table_id, v_table_number, v_waiter_name
  FROM orders o
  LEFT JOIN tables t ON t.id = o.table_id
  LEFT JOIN staff s ON s.id = p_waiter_id
  WHERE o.id = p_order_id;

  -- Snapshot pending items for printing
  SELECT jsonb_agg(jsonb_build_object(
    'item_name', oi.item_name,
    'variant_name', oi.variant_name,
    'qty', oi.qty,
    'special_instructions', oi.special_instructions
  )) INTO v_items_snap
  FROM order_items oi
  WHERE oi.order_id = p_order_id AND oi.kot_status = 'pending';

  -- Create KOT batch record
  INSERT INTO kot_batches (
    restaurant_id, order_id, table_id, table_number,
    batch_number, kot_number, sent_by, sent_by_name,
    item_count, is_addon, items_snapshot
  ) VALUES (
    p_restaurant_id, p_order_id, v_table_id, v_table_number,
    v_batch_number, v_kot_number, p_waiter_id, v_waiter_name,
    v_item_count, v_is_addon, v_items_snap
  ) RETURNING id INTO v_kot_batch_id;

  -- Update pending items → sent (THIS IS THE KEY UPDATE)
  UPDATE order_items
  SET kot_status = 'sent', kot_batch = v_batch_number, kot_sent_at = NOW()
  WHERE order_id = p_order_id AND kot_status = 'pending';

  -- Update order timestamp
  UPDATE orders SET updated_at = NOW() WHERE id = p_order_id;

  -- Notify admin and kitchen via realtime events
  INSERT INTO realtime_events (restaurant_id, event_type, payload, triggered_by)
  VALUES (
    p_restaurant_id, 'kot_sent',
    jsonb_build_object(
      'order_id', p_order_id, 'table_number', v_table_number,
      'kot_number', v_kot_number, 'batch_number', v_batch_number,
      'is_addon', v_is_addon, 'item_count', v_item_count,
      'kot_batch_id', v_kot_batch_id, 'waiter_name', v_waiter_name
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

# PART 4 — THE FRONTEND FIX

---

## [PASTE INTO BUILDER — ADD ITEM LOGIC FIX]

```
Fix the "Add Item to Order" logic in the waiter app.

THE RULE (implement this exactly):
When adding an item to an existing order:
  - ALWAYS INSERT a new order_items row
  - NEVER UPDATE an existing row's qty
  - NEVER check if the same item already exists in the cart
  - New row always has: kot_status = 'pending', kot_batch = 0

This is true even if:
  - The same item with the same variant is already in the cart
  - The existing item has kot_status = 'sent'
  - The existing item has kot_status = 'pending'

The ONLY exception: if the waiter taps [+] on a PENDING item's qty stepper
(item with kot_batch = 0), that specific row's qty can increase.
This is okay because the item hasn't been sent to kitchen yet.

IMPLEMENT THIS:

// When user taps an item card in the menu:
function handleAddItem(item, variant, qty, instructions) {
  // ALWAYS insert new row — no merging, no qty updates
  supabase.from('order_items').insert({
    order_id:             currentOrderId,
    restaurant_id:        restaurantId,
    item_id:              item.id,
    variant_id:           variant?.id ?? null,
    item_name:            item.name,
    variant_name:         variant?.name ?? null,
    unit_price:           variant?.price ?? item.base_price,
    qty:                  qty,
    special_instructions: instructions ?? null,
    kot_status:           'pending',   // ALWAYS
    kot_batch:            0,           // ALWAYS
    added_by:             waiterId,
  });
}

// When user taps [+] on a cart item's qty stepper:
function handleIncreaseQty(orderItem) {
  if (orderItem.kot_status === 'pending') {
    // Safe to increase qty — not sent yet
    supabase.from('order_items')
      .update({ qty: orderItem.qty + 1 })
      .eq('id', orderItem.id);
  } else {
    // Item already sent — create new pending row for the 1 extra
    supabase.from('order_items').insert({
      order_id:             orderItem.order_id,
      restaurant_id:        restaurantId,
      item_id:              orderItem.item_id,
      variant_id:           orderItem.variant_id,
      item_name:            orderItem.item_name,
      variant_name:         orderItem.variant_name,
      unit_price:           orderItem.unit_price,
      qty:                  1,           // just 1 extra
      special_instructions: orderItem.special_instructions,
      kot_status:           'pending',   // ALWAYS new row = pending
      kot_batch:            0,           // ALWAYS new row = 0
      added_by:             waiterId,
    });
    
    // Show a toast to inform waiter:
    toast("Extra item added as Add-On KOT. Tap 'Send KOT' to send to kitchen.");
  }
}

// [Send KOT] button enabled state:
const hasPendingItems = orderItems.some(item => item.kot_status === 'pending');
// Button is RED and active when hasPendingItems === true
// Button is GRAY and disabled when hasPendingItems === false

// How to send KOT (call RPC, not manual updates):
async function sendKOT() {
  const result = await supabase.rpc('send_kot', {
    p_order_id:      currentOrderId,
    p_waiter_id:     waiterId,
    p_restaurant_id: restaurantId,
  });
  
  if (result.data.success) {
    // Refresh order items from Supabase
    // Show success toast with KOT number
    if (result.data.is_addon) {
      toast.success(`Add-On KOT sent! ${result.data.item_count} item(s) to kitchen`);
    } else {
      toast.success(`KOT #${result.data.batch_number} sent! ${result.data.item_count} items`);
    }
  }
}
```

---

## [PASTE INTO BUILDER — CART DISPLAY FIX]

```
Fix the cart display in the order screen to show items grouped by KOT batch.

The cart should show items in this order:
1. Sent batches (batch 1, 2, 3...) — each with a labeled section header
2. Pending items at the bottom — always labeled "Pending — not sent yet"

IMPLEMENT THIS GROUPING LOGIC:

function groupItemsByBatch(orderItems) {
  const batches = {};
  
  for (const item of orderItems) {
    const key = item.kot_status === 'pending' ? 'pending' : `batch_${item.kot_batch}`;
    if (!batches[key]) batches[key] = [];
    batches[key].push(item);
  }
  
  // Sort: batch_1 first, batch_2 second, ... pending last
  const sortedKeys = Object.keys(batches).sort((a, b) => {
    if (a === 'pending') return 1;   // pending always last
    if (b === 'pending') return -1;
    return parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]);
  });
  
  return sortedKeys.map(key => ({
    key,
    label: key === 'pending' 
      ? '⏳ Pending — Not sent yet'
      : `KOT #${key.split('_')[1]}`,
    isAddon: key !== 'pending' && parseInt(key.split('_')[1]) > 1,
    items: batches[key]
  }));
}

RENDER LIKE THIS:

For each group:
  Show section header: "── KOT #1  ·  Sent at 2:15 PM ──────────────"
  For add-on groups: "── KOT #2 (Add-On) ·  2:38 PM ──────────────"
  For pending: "── ⏳ Pending  ·  Not sent yet ───────────────"
  
  Under each header: show that group's items

KOT status chip per item:
  pending     → yellow chip "⏳ PENDING"
  sent        → blue chip "KOT SENT ✓"
  preparing   → orange chip "👨‍🍳 PREPARING"
  ready       → green chip "✅ READY"
  served      → gray chip "SERVED"
  cancelled   → red strikethrough chip "CANCELLED"

[Send KOT] button:
  - Count items where kot_status === 'pending'
  - If count > 0: button is RED, shows "SEND KOT · {count} items"
  - If count === 0: button is GRAY (disabled), shows "SEND KOT"
  - Button appears in cart header AND in bottom sticky action bar
```

---

# PART 5 — EDGE CASES

---

## [PASTE INTO BUILDER — EDGE CASE HANDLING]

```
Handle all these edge cases in the KOT system:

EDGE CASE 1: Cancelling a sent item
When waiter taps [−] on a sent item (qty becomes 0 or remove is tapped):

Show this confirmation sheet:
  "Crispy Corn was already sent to kitchen.
   
   Choose what to do:
   [Keep it — don't change]
   [Remove from bill only]  ← customer doesn't pay, kitchen still makes it
   [Cancel from kitchen]    ← sends cancellation, removes from bill"

On "Cancel from kitchen":
  - UPDATE order_items SET kot_status = 'cancelled' WHERE id = item.id
  - INSERT realtime_events { type: 'item_cancelled', item_name: 'Crispy Corn', table: 'T5' }
  - Admin and kitchen see cancellation notification
  - Item shows as CANCELLED (strikethrough) in cart — not deleted, stays visible

On "Remove from bill only":
  - UPDATE order_items SET kot_status = 'cancelled' WHERE id = item.id
  - No kitchen notification
  - Item shows as CANCELLED in cart

EDGE CASE 2: Modifying instructions on a sent item
Waiter long-presses a sent item → edit sheet opens.
Special instructions text field is editable.
On save:
  - UPDATE order_items SET special_instructions = new_value WHERE id = item.id
  - INSERT realtime_events { type: 'item_note_updated', message: 'Paneer Tikka: add note "extra sauce"' }
  - Toast: "Note updated. You may need to verbally inform kitchen."
  (Do NOT resend KOT just for a note change)

EDGE CASE 3: Same item added twice from menu (both pending)
If waiter taps "Butter Naan" twice quickly:
  - Two separate INSERT rows, both with kot_batch=0, kot_status='pending'
  - Cart shows: "Butter Naan ×1 [PENDING]" and "Butter Naan ×1 [PENDING]" as separate rows
  - This is fine — both will be sent together in the next KOT
  - (Optional UX improvement: merge them visually in display only, but keep as separate DB rows)

EDGE CASE 4: Waiter sends KOT, then loses connection
  - Use Supabase RPC with SECURITY DEFINER (atomic transaction)
  - If RPC call fails: items stay as 'pending' — safe to retry
  - Never mark items as 'sent' on the client before RPC confirms success
  - Show error toast: "KOT not sent — check connection. Tap again to retry."
  - [Send KOT] button stays active (not disabled on failure)

EDGE CASE 5: Two waiters on same table (if allowed)
  - Waiter A adds Paneer Tikka (pending)
  - Waiter B adds Butter Chicken (pending) at same time
  - Waiter A sends KOT: both items sent in one batch (or A's pending only — depends on order_id filter)
  - Use restaurant_id + order_id filter, not waiter_id filter, when sending KOT
  - All pending items for that ORDER get sent, regardless of which waiter added them

EDGE CASE 6: Sending KOT with empty order (no items)
  - [Send KOT] button is disabled (gray) when no pending items
  - RPC function also returns error: 'No pending items to send'
  - Never allow sending an empty KOT

EDGE CASE 7: Bill requested but waiter tries to add item
  - When orders.status = 'bill_requested': disable the menu section and add buttons
  - Show banner in cart: "Bill requested — cannot add more items"
  - [Send KOT] button hidden
  - Only [View Order] available
  - If waiter needs to add item anyway: must press "Reopen Order" button which requires manager confirmation

EDGE CASE 8: Duplicate KOT number on same day
  - KOT number generation uses COUNT(*) + 1 from kot_batches WHERE date = today
  - This can have a race condition if two KOTs are sent simultaneously
  - Fix: use a PostgreSQL sequence per restaurant per day, OR use advisory lock in RPC
  - Add UNIQUE constraint on (restaurant_id, kot_number) to catch duplicates at DB level
  - If duplicate: RPC retries with incremented number automatically
```

---

# PART 6 — ADMIN PRINT SIDE

---

## [PASTE INTO BUILDER — ADMIN PRINT FIX]

```
Fix the admin print system to correctly handle Add-On KOTs.

The admin print center at /admin/print should:

1. Show all kot_batches where is_printed = false, ordered by sent_at ASC

2. Each KOT card in the print list shows:
   - KOT number (e.g. KOT-20260408-047)
   - "ADD-ON KOT" orange badge if is_addon = true
   - Table number
   - Waiter name
   - Time sent
   - Item count
   - The items from items_snapshot:
     Each item: qty × item_name [variant_name] — special instructions

3. [PRINT] button on each KOT card:
   - Triggers window.print() with only that KOT's content visible
   - KOT print format (80mm thermal paper width):
   
     ================================
     [Restaurant Name]
     KOT #: KOT-20260408-047
     ================================
     TABLE: T5         DATE: 08/04/26
     WAITER: Ravi Kumar TIME: 14:38
     *** ADD-ON KOT ***  ← show if is_addon
     ================================
     
     1x  CRISPY CORN [FULL]          
         >> Extra crispy             
                                     
     2x  GARLIC NAAN                 
     ================================
     BATCH 2 OF 2 FOR TABLE T5
     ================================
   
   - After print: UPDATE kot_batches SET is_printed = true, printed_at = NOW()
   - Card disappears from Pending list
   - Moves to Print History

4. Auto-print (when toggle is ON):
   - Subscribe to kot_batches INSERT events via Supabase Realtime
   - On INSERT: immediately call window.print() with that KOT
   - Show brief toast: "Auto-printing KOT-20260408-047..."
   - No manual action needed from admin

5. Print ALL pending button:
   - Prints all unprinted KOTs one after another
   - Marks all as printed
   - Shows progress: "Printing 3 of 5 KOTs..."

6. KOT History tab:
   - All past kot_batches (is_printed = true) in reverse order
   - [Reprint] button on each — prints again with "REPRINT" header, does NOT change is_printed status
```

---

# PART 7 — HOW THE COMPLETE FIX WORKS END TO END

---

## The Fixed Scenario (Step by Step)

```
2:00 PM — Table 1 places initial order:

  DATABASE STATE:
  order_items:
  id | item_name     | qty | kot_batch | kot_status
  ───┼───────────────┼─────┼───────────┼───────────
   1 │ Paneer Tikka  │  2  │     0     │  pending
   2 │ Crispy Corn   │  1  │     0     │  pending

  UI STATE:
  Cart shows:
  ── ⏳ Pending ──────────────────────────
    ● Paneer Tikka [Full] ×2  [⏳ PENDING]  ₹360
    ◉ Crispy Corn [Full]  ×1  [⏳ PENDING]  ₹180
  
  [SEND KOT] button = RED (2 pending items)

─────────────────────────────────────────────────────

  Waiter taps [Send KOT] → confirms → RPC send_kot() runs:
  
  DATABASE STATE:
  order_items:
  id | item_name     | qty | kot_batch | kot_status
  ───┼───────────────┼─────┼───────────┼───────────
   1 │ Paneer Tikka  │  2  │     1     │  sent      ← updated
   2 │ Crispy Corn   │  1  │     1     │  sent      ← updated

  kot_batches:
  id | batch_number | kot_number          | is_addon
  ───┼──────────────┼─────────────────────┼─────────
   A │      1       │ KOT-20260408-047    │  false

  UI STATE:
  Cart shows:
  ── KOT #1 · Sent at 2:00 PM ───────────
    ● Paneer Tikka [Full] ×2  [KOT SENT ✓]
    ◉ Crispy Corn [Full]  ×1  [KOT SENT ✓]
  
  [SEND KOT] button = GRAY (0 pending items)
  
  Admin print center: KOT-047 appears in Pending KOTs list ✓
  Kitchen display: New KOT card appears ✓

─────────────────────────────────────────────────────

2:30 PM — Customer wants 1 more Crispy Corn:

  Waiter taps Crispy Corn in menu → handleAddItem() runs:
  
  INSERTS NEW ROW (does NOT touch existing row #2):
  
  DATABASE STATE:
  order_items:
  id | item_name     | qty | kot_batch | kot_status
  ───┼───────────────┼─────┼───────────┼───────────
   1 │ Paneer Tikka  │  2  │     1     │  sent
   2 │ Crispy Corn   │  1  │     1     │  sent      ← UNTOUCHED
   3 │ Crispy Corn   │  1  │     0     │  pending   ← NEW ROW ✓

  UI STATE:
  Cart shows:
  ── KOT #1 · Sent at 2:00 PM ───────────
    ● Paneer Tikka [Full] ×2  [KOT SENT ✓]
    ◉ Crispy Corn [Full]  ×1  [KOT SENT ✓]
  
  ── ⏳ Pending ──────────────────────────
    ◉ Crispy Corn [Full]  ×1  [⏳ PENDING] ← the new one
  
  [SEND KOT] button = RED (1 pending item) ✓
  
  Toast shows: "Item added. Tap 'Send KOT' to send to kitchen."

─────────────────────────────────────────────────────

  Waiter taps [Send KOT] → confirms → RPC send_kot() runs again:
  
  DATABASE STATE:
  order_items:
  id | item_name     | qty | kot_batch | kot_status
  ───┼───────────────┼─────┼───────────┼───────────
   1 │ Paneer Tikka  │  2  │     1     │  sent
   2 │ Crispy Corn   │  1  │     1     │  sent
   3 │ Crispy Corn   │  1  │     2     │  sent      ← updated

  kot_batches:
  id | batch_number | kot_number          | is_addon
  ───┼──────────────┼─────────────────────┼─────────
   A │      1       │ KOT-20260408-047    │  false
   B │      2       │ KOT-20260408-048    │  true    ← ADD-ON KOT ✓

  UI STATE:
  Cart shows:
  ── KOT #1 · Sent at 2:00 PM ───────────
    ● Paneer Tikka [Full] ×2  [KOT SENT ✓]
    ◉ Crispy Corn [Full]  ×1  [KOT SENT ✓]

  ── KOT #2 (Add-On) · Sent at 2:30 PM ──
    ◉ Crispy Corn [Full]  ×1  [KOT SENT ✓] ← clearly labeled
  
  [SEND KOT] button = GRAY (0 pending) ✓
  
  Admin print center: KOT-048 "ADD-ON" appears ✓
  Kitchen gets: ADD-ON KOT for Table 1: +1× Crispy Corn ✓
  Bill total: correctly shows total of rows 1+2+3 = ₹360+₹180+₹180 = ₹720 ✓
```

**FIXED. The bug is completely eliminated.**

---

# PART 8 — BILL CALCULATION FIX

---

## [PASTE INTO BUILDER — BILLING CALCULATION]

```
Fix bill calculation to correctly sum ALL order_items for an order.

The bill should include ALL rows in order_items for this order,
EXCEPT rows with kot_status = 'cancelled'.

CORRECT bill calculation:

SELECT 
  SUM(qty * unit_price) as subtotal,
  COUNT(*) as item_count
FROM order_items
WHERE 
  order_id = :orderId
  AND kot_status != 'cancelled'   -- exclude cancelled items

Bill total = subtotal + tax + service_charge - discount + packaging - round_off

For display in cart, group items for the customer view:
  - Group by (item_name, variant_name, special_instructions, unit_price)
  - Sum qty across groups (for display only — DB keeps separate rows)
  - Show grouped: "Crispy Corn [Full] × 2   ₹360" (even though it's 2 DB rows)

This means:
  - DB rows: Crispy Corn ×1 (KOT batch 1) + Crispy Corn ×1 (KOT batch 2)
  - Display to customer on bill: Crispy Corn × 2  ₹360
  - Kitchen tracking remains separate per batch

Implement this grouping for the bill print only:
const billItems = groupBy(
  orderItems.filter(i => i.kot_status !== 'cancelled'),
  item => `${item.item_name}|${item.variant_name}|${item.special_instructions}|${item.unit_price}`
);

// billItems maps to: { itemKey: { name, variant, instructions, price, totalQty, lineTotal } }
```

---

# PART 9 — TESTING CHECKLIST

---

## Test These Scenarios After Implementation

Paste this into your builder after implementing the fix:

```
Test the KOT system with these exact scenarios and verify each outcome:

TEST 1 — Basic KOT Send
  1. Start new order at Table T1
  2. Add: 2× Paneer Tikka, 1× Crispy Corn
  3. Verify: Cart shows all 3 as [⏳ PENDING], [Send KOT] button is red
  4. Tap [Send KOT] → confirm
  5. Verify: All items show [KOT SENT ✓], [Send KOT] button is gray
  6. Verify: kot_batches table has 1 row, batch_number=1, is_addon=false
  7. Verify: Admin print center shows this KOT in pending list

TEST 2 — Add-On KOT (THE MAIN BUG)
  1. Continue same order from TEST 1
  2. Tap Crispy Corn in menu → add 1×
  3. Verify: Cart shows old items as [KOT SENT ✓] AND new Crispy Corn as [⏳ PENDING]
  4. Verify: [Send KOT] button is now RED again (shows "1 item")
  5. Tap [Send KOT] → confirm
  6. Verify: New Crispy Corn shows [KOT SENT ✓]
  7. Verify: Toast says "Add-On KOT sent! 1 item"
  8. Verify: kot_batches has 2nd row, batch_number=2, is_addon=true
  9. Verify: Admin print shows second KOT with "ADD-ON KOT" label
  10. Verify: Bill total = 2×₹180 (Paneer Tikka) + 1×₹180 (Crispy Corn) + 1×₹180 (add-on) = ₹720

TEST 3 — Multiple Add-Ons
  1. After TEST 2, add: 2× Garlic Naan + 1× Chicken Curry
  2. Tap [Send KOT]
  3. Verify: Third KOT batch created, batch_number=3, is_addon=true
  4. Verify: Cart shows 3 KOT groups + no pending

TEST 4 — Increase Qty on Pending Item
  1. New order at Table T2
  2. Add 1× Butter Naan (pending, not sent)
  3. Tap [+] on Butter Naan qty
  4. Verify: qty becomes 2, same row, kot_batch still = 0 (no new row created)

TEST 5 — Increase Qty on Sent Item
  1. After TEST 1, tap [+] on Paneer Tikka (which has kot_status='sent')
  2. Verify: A NEW row is created for Paneer Tikka with qty=1, kot_batch=0
  3. Verify: [Send KOT] button becomes red again
  4. Verify: Cart now shows old Paneer Tikka ×2 [KOT SENT] + new Paneer Tikka ×1 [PENDING]

TEST 6 — Bill Calculation Correct
  1. Complete TEST 2 fully
  2. Tap [Request Bill]
  3. Verify bill shows: Paneer Tikka ×2 + Crispy Corn ×2 = ₹720 subtotal
  4. Verify Crispy Corn is shown as quantity 2 (not two separate rows) on the bill

TEST 7 — Cancel Sent Item
  1. After TEST 1, tap [−] on Crispy Corn (sent item)
  2. Verify: Confirmation sheet shows 3 options
  3. Choose "Cancel from kitchen"
  4. Verify: item shows CANCELLED (strikethrough)
  5. Verify: realtime_events has item_cancelled event
  6. Verify: Bill total reduces by ₹180

All 7 tests must pass. Fix any failing scenarios before proceeding.
```

---

# SUMMARY — THE COMPLETE FIX IN 4 RULES

---

```
RULE 1: ALWAYS INSERT new order_items rows — never UPDATE qty of sent items
        kot_status='sent' means that row is immutable from kitchen's perspective

RULE 2: New rows ALWAYS start with: kot_status='pending', kot_batch=0
        The batch number is assigned only when Send KOT is tapped

RULE 3: [Send KOT] button is enabled when ANY row has kot_status='pending'
        The button sends ALL pending rows in one atomic operation

RULE 4: Bill sums ALL non-cancelled rows
        Display can GROUP rows by item for the printed bill
        But the DATABASE always keeps them as separate rows
```

---

*RestaurantOS KOT Issue — Complete Fix Documentation*
*Version 1.0 · April 2026*
