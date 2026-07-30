# 🍽️ RestaurantOS — Waiter App
## Complete Antigravity / Lovable Build Prompt
### Full Feature Spec · Zomato-Style UI · KOT Bug Fixed · Seamless Admin Sync

---

> **HOW TO USE:** Send each SECTION as a separate prompt to your AI builder.
> Start with SECTION 0. Wait for full build before next section.
> Never combine sections — each one is its own complete prompt.

---

# SECTION 0 — PROJECT FOUNDATION & ARCHITECTURE

## Paste this first. Everything depends on this.

---

Build **RestaurantOS Waiter App** — a fast, mobile-first Progressive Web App (PWA) used by restaurant waiters on Android phones and tablets. Waiters use it to manage table orders, send KOTs to the kitchen, and sync everything instantly with the Admin dashboard.

This is ONE of THREE apps that share a single Supabase project:

```
App 1: HQ Admin Portal     → /hq       (web, desktop) — you control this
App 2: Restaurant Admin    → /admin    (web, tablet)   — restaurant owner uses this
App 3: Waiter App          → /waiter   (PWA, mobile)   — waiters use this
```

All three read/write the SAME Supabase database. Role-based RLS ensures each role only sees their restaurant's data.

---

## Tech Stack

```
Framework:      React 18 + TypeScript + Vite
Styling:        Tailwind CSS v3 + shadcn/ui
Routing:        React Router v6 (createBrowserRouter)
Global State:   Zustand
Server State:   TanStack Query v5 (React Query)
Backend/DB:     Supabase (PostgreSQL + Auth + Realtime + Storage + RPC)
PWA:            vite-plugin-pwa (installable, offline-capable)
Forms:          React Hook Form + Zod validation
Toasts:         React Hot Toast (top-center position)
Animations:     Framer Motion (lightweight — 200ms max)
Icons:          Lucide React
Dates:          date-fns
HTTP:           Supabase JS client only (no axios)
```

---

## Design System — Zomato/Swiggy Inspired

```
Colors:
  Brand Red:      #E23744   ← primary actions, active states, CTA buttons
  Near Black:     #1C1C1E   ← page titles, important text
  Surface:        #FFFFFF   ← cards, modals, sheets
  Page BG:        #F2F2F7   ← iOS-style off-white background
  Success:        #00A676   ← available, confirmed, ready
  Warning:        #FF9500   ← pending, attention, reserved
  Danger:         #FF3B30   ← occupied, error, urgent
  Info:           #007AFF   ← KOT sent, info states
  Muted:          #8E8E93   ← secondary text, placeholders
  Divider:        #E5E5EA   ← borders, separators

Typography (use Inter from Google Fonts):
  Page Title:     22px / 700 weight / #1C1C1E
  Section Header: 17px / 600 weight / #1C1C1E
  Card Title:     16px / 600 weight / #1C1C1E
  Body:           15px / 400 weight / #3C3C3E
  Caption:        13px / 400 weight / #8E8E93
  Micro:          11px / 500 weight / #8E8E93 (badges, chips)

Spacing:   8px base grid — use 8, 12, 16, 20, 24, 32, 48px
Radius:    16px cards, 12px buttons, 20px pill chips, 8px inputs
Shadows:
  Card:          0 2px 8px rgba(0,0,0,0.08)
  Modal/Sheet:   0 -4px 32px rgba(0,0,0,0.18)
  FAB:           0 4px 16px rgba(226,55,68,0.40)

Touch Targets:   MINIMUM 44×44px for ALL tappable elements
Transitions:     150ms for instant feedback, 250ms for sheets/modals
```

---

## Complete Database Schema

Create ALL tables in Supabase before building any UI:

```sql
-- ═══════════════════════════════════════════════
-- HQ LEVEL
-- ═══════════════════════════════════════════════

CREATE TABLE hq_admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurant_activations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_key TEXT UNIQUE NOT NULL,    -- e.g. "REST-2026-KPQR78"
  restaurant_id  UUID,                    -- filled when restaurant claims key
  is_active      BOOLEAN DEFAULT FALSE,
  plan           TEXT DEFAULT 'starter',  -- starter | pro | enterprise
  max_staff      INT DEFAULT 10,
  activated_at   TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_by     UUID REFERENCES hq_admins(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- RESTAURANT LEVEL
-- ═══════════════════════════════════════════════

CREATE TABLE restaurants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_key TEXT REFERENCES restaurant_activations(activation_key),
  name           TEXT NOT NULL,
  logo_url       TEXT,
  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  state          TEXT,
  pin            TEXT,
  phone          TEXT,
  email          TEXT,
  gstin          TEXT,
  fssai          TEXT,
  currency       TEXT DEFAULT 'INR',
  timezone       TEXT DEFAULT 'Asia/Kolkata',
  is_active      BOOLEAN DEFAULT TRUE,
  settings       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Staff (all restaurant employees — waiters, cashiers, kitchen, managers)
CREATE TABLE staff (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  auth_user_id   UUID REFERENCES auth.users(id) UNIQUE,
  name           TEXT NOT NULL,
  staff_id       TEXT NOT NULL,          -- waiter's login ID e.g. "W001"
  pin            TEXT NOT NULL,          -- bcrypt hashed 4-digit PIN
  role           TEXT NOT NULL,
    -- waiter | captain | cashier | kitchen | manager | admin
  avatar_color   TEXT DEFAULT '#E23744', -- for avatar initials display
  is_active      BOOLEAN DEFAULT TRUE,
  last_login     TIMESTAMPTZ,
  created_by     UUID REFERENCES staff(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, staff_id)        -- staff_id unique per restaurant
);

-- ═══════════════════════════════════════════════
-- FLOOR & TABLE
-- ═══════════════════════════════════════════════

CREATE TABLE floors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,          -- "Main Hall", "Terrace", "AC Room"
  display_order  INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE
);

CREATE TABLE tables (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  floor_id         UUID REFERENCES floors(id) ON DELETE CASCADE,
  number           TEXT NOT NULL,       -- "T1", "T2", "1", "A1" etc.
  capacity         INT DEFAULT 4,
  shape            TEXT DEFAULT 'square', -- square | round | rectangle
  status           TEXT DEFAULT 'available',
    -- available | occupied | reserved | dirty | blocked
  current_order_id UUID,               -- fast lookup — updated on order create/close
  UNIQUE(restaurant_id, number)
);

-- ═══════════════════════════════════════════════
-- MENU
-- ═══════════════════════════════════════════════

CREATE TABLE menu_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  item_type      TEXT DEFAULT 'both',  -- veg | nonveg | both
  emoji          TEXT,                  -- optional emoji for display
  display_order  INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE
);

CREATE TABLE menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id    UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  base_price     DECIMAL(10,2) NOT NULL,
  item_type      TEXT DEFAULT 'veg',   -- veg | nonveg | egg | vegan
  image_url      TEXT,
  is_available   BOOLEAN DEFAULT TRUE,
  is_featured    BOOLEAN DEFAULT FALSE,
  tax_rate       DECIMAL(5,2) DEFAULT 5.00,
  display_order  INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_variants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id        UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,        -- "Half", "Full", "Small", "Large"
  price          DECIMAL(10,2) NOT NULL, -- ABSOLUTE price, not modifier
  is_available   BOOLEAN DEFAULT TRUE,
  is_default     BOOLEAN DEFAULT FALSE,
  display_order  INT DEFAULT 0
);

-- ═══════════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════════

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  table_id        UUID REFERENCES tables(id),
  floor_id        UUID REFERENCES floors(id),
  order_type      TEXT DEFAULT 'dinein', -- dinein | takeaway | delivery
  status          TEXT DEFAULT 'active',
    -- active | bill_requested | billed | settled | cancelled
  waiter_id       UUID REFERENCES staff(id),
  guest_count     INT DEFAULT 1,
  token_number    TEXT,                  -- for takeaway: "T-042"
  customer_name   TEXT,                  -- for takeaway/delivery
  customer_phone  TEXT,
  customer_address TEXT,                 -- for delivery
  is_priority     BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- ORDER ITEMS — THE HEART OF THE KOT SYSTEM
-- ═══════════════════════════════════════════════

CREATE TABLE order_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  restaurant_id        UUID REFERENCES restaurants(id) NOT NULL,
  item_id              UUID REFERENCES menu_items(id),
  variant_id           UUID REFERENCES menu_variants(id),

  -- SNAPSHOT: copy name+price at time of order (protects against menu changes)
  item_name            TEXT NOT NULL,
  variant_name         TEXT,
  unit_price           DECIMAL(10,2) NOT NULL,

  qty                  INT NOT NULL DEFAULT 1,
  special_instructions TEXT,

  -- ── KOT BATCH TRACKING (fixes the KOT add-on bug) ──────────────────────
  kot_status  TEXT DEFAULT 'pending',
    -- pending | sent | preparing | ready | served | cancelled
  kot_batch   INT DEFAULT 0,
    -- 0 = not sent yet (pending)
    -- 1 = sent in 1st KOT batch
    -- 2 = sent in 2nd KOT batch (add-on)
    -- N = sent in Nth KOT batch
  kot_sent_at TIMESTAMPTZ,
  -- ────────────────────────────────────────────────────────────────────────

  added_by    UUID REFERENCES staff(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- KOT BATCHES — tracks every KOT send event
-- ═══════════════════════════════════════════════

CREATE TABLE kot_batches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) NOT NULL,
  order_id       UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  table_id       UUID REFERENCES tables(id),
  table_number   TEXT,                  -- snapshot
  batch_number   INT NOT NULL,          -- 1, 2, 3... per order
  kot_number     TEXT NOT NULL,         -- "KOT-20260408-047" — global per restaurant+day
  sent_by        UUID REFERENCES staff(id),
  sent_by_name   TEXT,                  -- snapshot
  item_count     INT DEFAULT 0,
  is_addon       BOOLEAN DEFAULT FALSE, -- TRUE when batch_number > 1
  items_snapshot JSONB,                 -- snapshot of items for printing
  is_printed     BOOLEAN DEFAULT FALSE,
  printed_at     TIMESTAMPTZ,
  sent_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- BILLS
-- ═══════════════════════════════════════════════

CREATE TABLE bills (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID REFERENCES restaurants(id) NOT NULL,
  order_id         UUID REFERENCES orders(id) NOT NULL,
  bill_number      TEXT NOT NULL,
  bill_type        TEXT DEFAULT 'gst',  -- gst | simple | complimentary | credit_note
  subtotal         DECIMAL(10,2) DEFAULT 0,
  discount_pct     DECIMAL(5,2) DEFAULT 0,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  discount_reason  TEXT,
  taxable_amount   DECIMAL(10,2) DEFAULT 0,
  cgst             DECIMAL(10,2) DEFAULT 0,
  sgst             DECIMAL(10,2) DEFAULT 0,
  service_charge   DECIMAL(10,2) DEFAULT 0,
  packaging_charge DECIMAL(10,2) DEFAULT 0,
  delivery_charge  DECIMAL(10,2) DEFAULT 0,
  round_off        DECIMAL(5,2) DEFAULT 0,
  grand_total      DECIMAL(10,2) DEFAULT 0,
  status           TEXT DEFAULT 'draft', -- draft | settled | void
  void_reason      TEXT,
  settled_at       TIMESTAMPTZ,
  cashier_id       UUID REFERENCES staff(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bill_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id     UUID REFERENCES bills(id) ON DELETE CASCADE,
  method      TEXT NOT NULL,  -- cash | upi | card | paytm | complimentary
  amount      DECIMAL(10,2) NOT NULL,
  reference   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- REALTIME EVENTS — fast notification bus
-- ═══════════════════════════════════════════════

CREATE TABLE realtime_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) NOT NULL,
  event_type     TEXT NOT NULL,
    -- kot_sent | item_added | order_created | bill_requested
    -- table_freed | order_cancelled | item_cancelled | priority_set
  payload        JSONB DEFAULT '{}',
  triggered_by   UUID REFERENCES staff(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id        UUID REFERENCES tables(id),
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  date            DATE NOT NULL,
  time            TIME NOT NULL,
  covers          INT DEFAULT 2,
  status          TEXT DEFAULT 'confirmed', -- confirmed | seated | noshow | cancelled
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE kot_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_events ENABLE ROW LEVEL SECURITY;

-- Policy: staff can only read/write their own restaurant's data
CREATE OR REPLACE FUNCTION get_staff_restaurant_id()
RETURNS UUID AS $$
  SELECT restaurant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Apply to each table (repeat for all tables above):
CREATE POLICY "own_restaurant_only" ON orders
  FOR ALL USING (restaurant_id = get_staff_restaurant_id());
```

---

## App Routes

```
/waiter/login              → Login (Staff ID + PIN)
/waiter/home               → Main table grid
/waiter/order/:orderId     → Active order screen
/waiter/new-order          → Start new order (order type selector)
/waiter/my-orders          → Today's orders for this waiter
/waiter/alerts             → Notifications & kitchen-ready alerts
/waiter/profile            → Waiter profile, shift info, logout

/admin/login               → Restaurant admin login
/admin/dashboard           → Admin overview
/admin/orders              → Live order management
/admin/print               → KOT and bill print center
/admin/staff               → Staff management
/admin/menu                → Menu management
/admin/tables              → Table setup
/admin/reports             → Basic reports
/admin/settings            → Restaurant settings

/hq/login                  → HQ admin login
/hq/dashboard              → Restaurant activation overview
/hq/keys                   → Activation key management
```

---

## Supabase Realtime Setup (create this hook once, use everywhere)

```typescript
// hooks/useRestaurantRealtime.ts

export function useRestaurantRealtime(restaurantId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`restaurant_${restaurantId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
          queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items',
          filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          if (payload.record?.order_id) {
            queryClient.invalidateQueries({
              queryKey: ['order', payload.record.order_id]
            });
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tables',
          filter: `restaurant_id=eq.${restaurantId}` },
        () => queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] })
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kot_batches',
          filter: `restaurant_id=eq.${restaurantId}` },
        () => queryClient.invalidateQueries({ queryKey: ['kot_batches', restaurantId] })
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'realtime_events',
          filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => handleRealtimeEvent(payload.new, queryClient)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [restaurantId, queryClient]);
}
```

---

---

# SECTION 1 — HQ ADMIN PORTAL

## Build at `/hq`

---

## HQ Login (`/hq/login`)

```
Full-screen dark background: #0A0A0F

Centered card (white, max-width 420px):
  [🍽️ RestaurantOS logo]
  "HQ Admin Portal"
  
  Email: [___________________]
  Password: [________________] [👁]
  
  [LOGIN TO HQ PORTAL →]
  
  Version 1.0 · HQ Access Only
```

- Supabase Auth login — checks `hq_admins` table for matching email
- On success → `/hq/dashboard`
- Wrong credentials: "Access denied. Invalid HQ credentials."

---

## HQ Dashboard (`/hq/dashboard`)

### Stats Row (4 cards):
- **Total Restaurants**: count of active restaurants
- **Active Today**: restaurants with orders in last 24h
- **Keys Issued**: total activation keys generated
- **Keys Unused**: keys with `is_active = false` and not expired

### Action Button:
**[+ Generate Activation Key]** — opens modal:
```
Plan:      [Starter ▾]  (Starter / Pro / Enterprise)
Max Staff: [10 ▾]       (5 / 10 / 25 / Unlimited)
Valid for: [90 days ▾]  (30 / 90 / 180 / 365 days)
Notes:     [____________]  (optional — e.g. "For Spice Garden, Bengaluru")

[GENERATE KEY]
```

On generate:
- Creates `restaurant_activations` record
- Key format: `REST-YYYY-XXXXXX` (e.g. `REST-2026-KPQR78`)
- Shows generated key in a highlighted box:
  ```
  ┌────────────────────────────────────────┐
  │  REST-2026-KPQR78                      │
  │                          [📋 COPY KEY] │
  └────────────────────────────────────────┘
  Send this key to the restaurant owner.
  They use it to register on the admin portal.
  ```

### Restaurants Table:

| Restaurant | City | Plan | Status | Activated | Last Active | Actions |
|---|---|---|---|---|---|---|

- **[View]**: opens restaurant detail modal (all settings, staff count, today's orders)
- **[Deactivate / Reactivate]**: toggles `restaurant_activations.is_active`
  - Deactivate: confirm dialog — "This will immediately log out all staff. Continue?"
  - Sets `is_active = false` → all staff logins for this restaurant stop working

---

## Keys Panel (`/hq/keys`)

Table of all generated keys:

| Key | Plan | Status | Restaurant | Created | Expires | Actions |
|---|---|---|---|---|---|---|

Status badges:
- 🟡 `UNUSED` — generated but not claimed
- 🟢 `ACTIVE` — restaurant registered and active
- 🔴 `EXPIRED` — past expiry date, never claimed
- ⚫ `DEACTIVATED` — manually deactivated

**[Revoke]** button: invalidates key immediately. If restaurant already active, blocks their access.
**[Extend]** button: adds 30/60/90 days to expiry.

---

---

# SECTION 2 — RESTAURANT ADMIN: REGISTRATION & SETUP

## Build at `/admin`

---

## Registration (`/admin/register`)

This is the first screen a new restaurant owner sees. They received an activation key from HQ.

```
[🍽️ RestaurantOS]

Set Up Your Restaurant

Step 1 of 3 — Activation

Activation Key:  [REST-2026-______]
                 Got this from RestaurantOS team

[VERIFY KEY →]
```

On verify:
1. Check `restaurant_activations` where `activation_key = entered` AND `expires_at > now()`
2. If not found → red error: "Invalid activation key. Contact RestaurantOS support."
3. If already claimed → "This key is already in use."
4. If valid → shows green checkmark, advances to Step 2

```
Step 2 of 3 — Restaurant Details

Restaurant Name:  [_________________]  *required
Phone:            [_________________]  *required
City:             [_________________]
State:            [_________________]
Address:          [_________________]
GSTIN:            [_________________]  (optional)
FSSAI:            [_________________]  (optional)
```

```
Step 3 of 3 — Create Admin Account

Your Name:         [_________________]
Email:             [_________________]
Password:          [_________________]  (min 8 chars)
Confirm Password:  [_________________]
```

**[ACTIVATE & CREATE ACCOUNT →]:**
1. Create restaurant record
2. Create Supabase auth user with email+password
3. Create `staff` record: role='admin', staff_id='ADMIN', pin='0000' (temporary)
4. Mark `restaurant_activations.is_active = true`, set `restaurant_id`, `activated_at`
5. Redirect to `/admin/dashboard`
6. Shows welcome toast: "Welcome to RestaurantOS! Complete your setup."

---

## Admin Login (`/admin/login`)

```
[🍽️ RestaurantOS — Admin]

Email:    [_________________]
Password: [_________________] [👁]

[LOGIN →]

New restaurant? → Register with activation key
```

---

## Admin Dashboard (`/admin/dashboard`)

**Top Navigation Tabs** (horizontal, full-width):
```
[📊 Dashboard] [📋 Orders] [🖨️ Print] [👥 Staff] [📖 Menu] [🪑 Tables] [⚙️ Settings]
```

### Dashboard Tab — Live Overview

4 KPI cards (real-time, update via Supabase subscription):
- **Active Orders**: count of orders with status 'active' or 'bill_requested'
- **Occupied Tables**: count of tables with status 'occupied'
- **KOTs Pending Print**: count of unprinted kot_batches
- **Today's Revenue**: sum of settled bills

Live Orders Feed (below KPI cards):
- Shows last 10 orders as compact cards
- Auto-updates via Supabase Realtime

---

## Admin Orders Tab (`/admin/orders`)

**Filter pills**: [All] [Active] [KOT Sent] [Bill Requested] [Settled]
**Floor filter**: [All Floors] [Main Hall] [Terrace] ...

### Order Row (table layout):

```
T5  |  Ravi Kumar  |  3 items  |  2:15 PM  |  🔵 KOT Sent  |  ₹640  |  [Print KOT] [Bill]
```

**[Print KOT]** button (per order):
- Opens printable KOT view
- Shows: Restaurant name, KOT number, table, waiter, time, all items with qty and instructions
- Calls `window.print()` → browser print dialog
- If ESC/POS printer configured: sends raw print command to printer IP
- On print: marks `kot_batches.is_printed = true`

**[Bill]** button:
- Opens bill generation modal (admin side)
- Calculate totals, select payment method, settle

**[View Details]** (click row):
- Expands inline OR opens side panel
- Shows full item list with KOT batch groups
- Shows KOT history: KOT #1 sent at 2:15 PM (3 items), KOT #2 sent at 2:38 PM (1 item)

---

## Admin Print Center (`/admin/print`)

The dedicated printing hub — most important screen for admin during service.

### Layout: Two-column tabs

**Tab 1: Pending KOTs**
List of all `kot_batches` where `is_printed = false`, newest first:

```
┌───────────────────────────────────────────────┐
│ KOT-20260408-047                  2:38 PM     │
│ Table T5  |  Add-On KOT  |  1 item            │
│ Waiter: Ravi Kumar                            │
│                                               │
│ + 1× Crispy Corn [Full]                       │
│   Special: Extra crispy                       │
│                                    [PRINT 🖨] │
└───────────────────────────────────────────────┘
```

**[PRINT 🖨]** button:
- Opens browser print dialog with KOT formatted for 80mm thermal paper
- OR sends ESC/POS raw command to printer IP if configured
- On success: marks `is_printed = true`, removes from pending list
- If auto-print enabled: prints automatically on KOT receipt from waiter

**[Print All Pending]** button at top:
- Prints all unprinted KOTs at once (one by one)

**Tab 2: Print History**
Table of all printed KOTs and bills with reprint option.

### Auto-Print Setting (top of print page):
```
Auto-print KOTs when received:  [ON/OFF toggle]
Printer Connection:             [LAN ▾]
Printer IP:                     [192.168.1.100]
Paper Width:                    [80mm ▾]

[Test Print]
```

When AUTO-PRINT is ON:
- Any new `kot_batches` insert triggers automatic print
- Uses Supabase Realtime to watch `kot_batches` table
- On INSERT: immediately triggers print without admin action

---

## Admin Staff Management (`/admin/staff`)

### Staff List

Cards layout (not table — more mobile-friendly on tablet):

```
┌─────────────────────────────────────────┐
│  [R]  Ravi Kumar                        │
│       Waiter · W001                     │
│       Last login: Today 10:02 AM        │
│       ● Active                          │
│  [Edit]  [Reset PIN]  [Deactivate]      │
└─────────────────────────────────────────┘
```

**[+ Add Staff Member]** button → Full-screen modal:

```
Add Staff Member

Name:       [_________________]  *required
Staff ID:   [W001]               *auto-suggested (W001, W002...), editable
                                   This is what they type at login
Role:       [Waiter ▾]           Waiter | Captain | Cashier | Kitchen | Manager

Set PIN (4 digits):
  [●] [●] [●] [●]    ← large tap targets, shows dots
  
Confirm PIN:
  [●] [●] [●] [●]

[CREATE STAFF MEMBER]
```

On create:
1. Create `staff` record with bcrypt-hashed PIN
2. Create Supabase Auth user with synthetic email: `{staffId}@{restaurantId}.pos`
3. Staff can now log into Waiter App with Staff ID + PIN

**[Edit]**: Change name, role (not Staff ID after creation)
**[Reset PIN]**: Enter new PIN twice — updates staff.pin
**[Deactivate/Activate]**: Toggle staff.is_active — blocks/restores login

---

---

# SECTION 3 — WAITER APP: LOGIN SCREEN

## Build at `/waiter/login`

---

The login screen is the first thing every waiter sees every shift.

## Full Design Spec

```
Background: dark gradient: linear-gradient(160deg, #1C1C1E 0%, #2C2C2E 60%, #3A1C1C 100%)

Center-aligned layout (no card border — floating elements):

  ┌────────────────────────────────────────┐
  │                                        │
  │         [Restaurant Logo]              │
  │         (white circle, 80px)           │
  │                                        │
  │         Spice Garden                   │
  │         (white, 22px semibold)         │
  │                                        │
  │    ┌──────────────────────────────┐    │
  │    │    STAFF LOGIN               │    │
  │    │    (white card, rounded-2xl) │    │
  │    │                              │    │
  │    │  Staff ID:                   │    │
  │    │  ┌────────────────────────┐  │    │
  │    │  │ W001                   │  │    │
  │    │  └────────────────────────┘  │    │
  │    │  e.g. W001, W002, K001       │    │
  │    │                              │    │
  │    │  PIN:                        │    │
  │    │  ┌──┐ ┌──┐ ┌──┐ ┌──┐        │    │
  │    │  │● │ │● │ │  │ │  │        │    │
  │    │  └──┘ └──┘ └──┘ └──┘        │    │
  │    │  (4 boxes, auto-focus next)  │    │
  │    │                              │    │
  │    │  [   LOGIN TO SHIFT →   ]    │    │
  │    │  (full-width, red button)    │    │
  │    │                              │    │
  │    └──────────────────────────────┘    │
  │                                        │
  │         Powered by RestaurantOS        │
  │         (gray, 12px)                   │
  │                                        │
  └────────────────────────────────────────┘
```

## PIN Input Behavior (critical UX detail):
- 4 individual `<input maxLength={1}>` boxes side by side
- Auto-advance: typing in box 1 → auto-focuses box 2, etc.
- Backspace in empty box → auto-focuses previous box
- Paste support: paste "1234" → fills all 4 boxes
- Each box shows a filled circle (●) not the digit
- On mobile: numeric keyboard shows automatically (`inputMode="numeric"`)
- Boxes shake with red color on wrong PIN (CSS shake animation)

## Login Logic:
1. User types Staff ID (e.g. "W001") — case insensitive
2. User taps or auto-advances to PIN after entering Staff ID
3. On PIN box 4 entry → auto-submits (no need to press Login button)
4. Also works if they manually tap [LOGIN] button
5. **Client-side:**
   - Query `staff` where `staff_id = entered AND restaurant_id = [configured]`
   - bcrypt.compare(enteredPin, staff.pin)
   - **Server-side (recommended)**: call Supabase RPC `login_with_pin(staff_id, pin, restaurant_id)` that returns JWT
6. On success: store in Zustand + localStorage → redirect to `/waiter/home`
7. On fail: shake animation, "Incorrect PIN", clear PIN boxes, keep Staff ID
8. After 5 failed attempts: 30-second lockout with visible countdown timer

## Session Persistence:
- Store: `{ staffId, staffName, role, restaurantId, restaurantName, authToken }`
- On app load: read localStorage → if valid and not expired → skip login → go to home
- Auto-logout: after 8 hours inactivity OR when staff.is_active becomes false (realtime check)

## Multi-staff Quick Switch:
At bottom of card after login: "Logged in as Ravi? [Switch User]"
- Clears only the session (not the restaurant config)
- Returns to login screen with Staff ID blank

---

---

# SECTION 4 — WAITER APP: HOME (TABLE GRID)

## Build at `/waiter/home`

---

The main screen. Waiter sees this constantly throughout their shift.

## Top App Bar

```
┌─────────────────────────────────────────────────────┐
│  [≡]   🍽️ RestaurantOS         [🔔 3]  [R●]        │
│        Spice Garden             alerts  waiter avatar │
└─────────────────────────────────────────────────────┘
```

- **[≡] Hamburger**: opens left sidebar drawer
- **[🔔 3]**: alerts badge (count of unread alerts) → goes to `/waiter/alerts`
- **[R●]**: avatar circle with initials + online dot → goes to `/waiter/profile`
- Green dot = connected to Supabase Realtime
- Amber dot = reconnecting
- Red dot = offline

## Sidebar Drawer (slides from left)

```
┌────────────────────────────┐
│  [R]  Ravi Kumar           │
│       Waiter · W001        │
│       On shift 10:02 AM    │
├────────────────────────────┤
│  🏠  Home                  │
│  📋  My Orders             │
│  🔔  Alerts         [3]   │
│  👤  My Profile            │
├────────────────────────────┤
│  📞  Call Admin            │
│  🌙  Dark Mode   [toggle]  │
├────────────────────────────┤
│  ← Logout                  │
└────────────────────────────┘
```

## Floor Tabs

Horizontal scrollable tabs below app bar:

```
[All  12/20]  [Main Hall  8/12]  [Terrace  3/6]  [AC Room  1/2]
```

Format: `[Floor Name  occupied/total]`
- Active tab: white background, red text, red bottom border
- Inactive tab: transparent, gray text
- Smooth scroll snap

## Table Grid

2-column grid (phone portrait) / 3-column (phone landscape / tablet):

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
gap: 12px;
padding: 16px;
```

### Table Card — AVAILABLE:
```
┌──────────────────────┐
│                      │
│   T5                 │
│   (24px bold green)  │
│                      │
│   👥 4 seats         │
│   (13px gray)        │
│                      │
│  ●  Available        │
│  (green dot + text)  │
│                      │
│  [+ NEW ORDER]       │
│  (full-width green)  │
│                      │
└──────────────────────┘
Border: 2px solid #00A676
Background: #FFFFFF
```

### Table Card — OCCUPIED (by this waiter):
```
┌──────────────────────┐
│  ⏱ 45 min            │  ← top-right, amber if > 30min
│                      │
│   T5                 │
│   (24px bold red)    │
│                      │
│   Ravi · 3 covers    │
│   5 items            │
│                      │
│   ₹640               │
│   (18px bold)        │
│   🔵 KOT Sent        │
│                      │
│  [VIEW ORDER →]      │
│  (full-width red)    │
│                      │
└──────────────────────┘
Border: 2px solid #FF3B30
Background: #FFF5F5
```

### Table Card — OCCUPIED (by another waiter):
```
┌──────────────────────┐
│  ⏱ 20 min            │
│                      │
│   T8                 │
│   (gray)             │
│                      │
│   Priya · 2 covers   │
│   ₹280               │
│                      │
│  [VIEW ONLY]         │
│  (gray, outline)     │
└──────────────────────┘
Border: 2px solid #C7C7CC
Background: #F9F9F9
Opacity: 0.8
```

### Table Card — BILL REQUESTED:
```
┌──────────────────────┐
│  💰 BILL             │  ← orange banner at very top
│                      │
│   T5                 │
│   Ravi · 3 covers    │
│   ₹640               │
│                      │
│  [VIEW ORDER]        │
│  (orange button)     │
└──────────────────────┘
Border: 2px solid #FF9500
Background: #FFFAEE
```

### Table Card — RESERVED:
```
┌──────────────────────┐
│                      │
│   T3                 │
│   (amber)            │
│                      │
│  📅 Reserved         │
│  Sharma · 7:30 PM    │
│  6 guests            │
│                      │
│  [SEAT GUEST]        │
│  (amber button)      │
│                      │
└──────────────────────┘
Border: 2px dashed #FF9500
```

### Table Card — DIRTY:
```
┌──────────────────────┐
│                      │
│   T9                 │
│   (gray)             │
│                      │
│  🧹 Needs Cleaning   │
│                      │
│  [MARK CLEAN]        │
│  (gray outline)      │
│                      │
└──────────────────────┘
Border: 2px solid #C7C7CC
Background: #F2F2F7
```

---

## Tapping a Table — Behavior by Status

| Status | On tap | Behavior |
|--------|--------|----------|
| Available | [+ NEW ORDER] | Show guest count sheet → create order → navigate to order screen |
| Occupied (mine) | [VIEW ORDER →] | Navigate to `/waiter/order/:orderId` |
| Occupied (other) | [VIEW ONLY] | Navigate to order screen in read-only mode |
| Bill Requested | [VIEW ORDER] | Navigate to order screen (shows bill requested status) |
| Reserved | [SEAT GUEST] | Convert reservation → new order |
| Dirty | [MARK CLEAN] | Confirm dialog → update status to 'available' |

## New Order Bottom Sheet (shown when tapping available table):
```
┌──────────────────────────────────────────┐
│  ─────── (drag handle) ───────           │
│                                          │
│  Start Order at Table T5                 │
│                                          │
│  Number of Guests:                       │
│  [−] [  2  ] [+]                         │
│                                          │
│  Notes (optional):                       │
│  ┌────────────────────────────────────┐  │
│  │ Birthday table, high chair needed  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [CANCEL]    [START ORDER →]             │
└──────────────────────────────────────────┘
```

On [START ORDER →]:
1. INSERT into `orders` (table_id, waiter_id, guest_count, status='active')
2. UPDATE `tables` SET status='occupied', current_order_id = new order id
3. INSERT into `realtime_events` (type='order_created', payload includes table number)
4. Navigate to `/waiter/order/:newOrderId`

---

## Floating Action Button (FAB)

Bottom-right corner, 56px circle, red, shadow:

```
Tap FAB → expands upward:
  🛵  Delivery
  🥡  Takeaway
  🍽️  New Dine-In
  ✕   (collapses)
```

Mini-FABs have labels. Tapping:
- **New Dine-In** → opens table selector sheet (all available tables)
- **Takeaway** → opens takeaway form sheet
- **Delivery** → opens delivery form sheet

---

## Bottom Navigation Bar (always visible)

```
┌──────────────────────────────────────────┐
│  🏠       📋       🔔       👤          │
│  Home   Orders  Alerts(3) Profile        │
└──────────────────────────────────────────┘
```

Active tab: red icon + label, slight red dot indicator at bottom

---

## Realtime Updates on Home Screen

The table grid subscribes to `tables` and `orders` tables via Supabase Realtime.

When any table changes (status, order total, etc.):
- The affected table card updates instantly — no page refresh
- If a table goes from "occupied" to "available": brief green flash animation on the card
- If new KOT is sent for a table: the status chip on that table card updates ("KOT Sent" label)
- If bill is settled: table resets to green "Available"

This means ALL waiters see the live floor status at all times.

---

---

# SECTION 5 — WAITER APP: ORDER SCREEN (FULL SPEC)

## Build at `/waiter/order/:orderId`

---

This is the most-used screen. It must be FAST, intuitive, and fault-tolerant.

## Screen Layout

The screen is a single vertical scroll with two logical sections:

```
┌─────────────────────────────────────────────┐
│  STICKY TOP BAR                             │
│  ← T5 | Dine-In | 3👥 | ₹640 | [⋮]       │
├─────────────────────────────────────────────┤
│                                             │
│  CART SECTION (scrollable)                  │
│  Shows all items in this order              │
│  Grouped by KOT batch                       │
│                                             │
│  [SEND KOT (2 pending)] ← sticky           │
│                                             │
├─────────────────────────────────────────────┤
│  ──── ADD MORE ITEMS ────── (sticky divider)│
├─────────────────────────────────────────────┤
│                                             │
│  MENU SECTION (scrollable)                  │
│  Search → Category tabs → Item grid         │
│                                             │
└─────────────────────────────────────────────┘
│  BOTTOM ACTION BAR (sticky)                 │
│  [Hold] [Send KOT (2)] [Request Bill]       │
└─────────────────────────────────────────────┘
```

---

## Top Bar

```
[← Back]  T5  |  Dine-In  |  3 👥  |  ₹640  [⋮]
```

- **[← Back]**: if pending items exist → show "You have unsent items. Leave?" confirm. Else go back.
- **Table number**: bold. Tapping opens table info popup.
- **Order type badge**: pill chip. Tappable to change (with confirmation).
- **3 👥**: guest count. Tappable to edit.
- **₹640**: running total (updates in real-time as items added/removed).
- **[⋮]**: more options (see below).

---

## Cart Section

### Cart Header:
```
🛒 Order   ·   5 items   ·   ₹640
```

### KOT Batch Grouping (THE FIX FOR KOT BUG):

Items in the cart are displayed in groups by `kot_batch`:

```
── KOT #1  ·  Sent at 2:15 PM  ──────────────────
  ● Paneer Tikka [Full]    ×2    [KOT SENT ✓]  ₹360
  ◉ Crispy Corn [Full]     ×1    [KOT SENT ✓]  ₹180

── KOT #2 (Add-On)  ·  Sent at 2:38 PM  ──────────
  ◉ Crispy Corn [Full]     ×1    [KOT SENT ✓]  ₹180

── ⏳ Pending  ·  Not sent yet  ───────────────────
  ● Garlic Naan            ×2    [⏳ PENDING]   ₹100
  ◉ Chicken Curry          ×1    [⏳ PENDING]   ₹280
```

Each section header is a thin divider line with text.

### Item Row Design:
```
┌─────────────────────────────────────────────────────┐
│  ● Paneer Tikka [Full]           [KOT SENT ✓]       │
│    No onion, extra sauce         (blue chip)        │
│                                                     │
│    [−] [2] [+]                         ₹360         │
└─────────────────────────────────────────────────────┘
```

**Item type dot**: green ● = veg, red ◉ = non-veg, brown ● = egg
**Item name**: bold, 15px
**Variant**: in brackets, gray text
**Special instructions**: italic, small, gray (only if present)

**KOT Status Chip (right side, per item):**
| Status | Chip Color | Text |
|--------|-----------|------|
| pending | amber/yellow | ⏳ PENDING |
| sent | blue | KOT SENT ✓ |
| preparing | orange | 👨‍🍳 PREPARING |
| ready | green | ✅ READY |
| served | gray | SERVED |
| cancelled | red strikethrough | CANCELLED |

**Quantity Controls ([−] [2] [+]):**
- `[+]` on PENDING item: increases qty normally
- `[+]` on SENT item: creates NEW pending row for that 1 extra item (same item, `kot_batch = 0`)
- `[−]` on PENDING item with qty > 1: decreases qty
- `[−]` on PENDING item with qty = 1: shows "Remove item?" red confirmation button
- `[−]` on SENT item: shows bottom sheet:
  ```
  ┌──────────────────────────────────────┐
  │  This item was sent to kitchen.      │
  │                                      │
  │  Crispy Corn [Full] ×1               │
  │  What do you want to do?             │
  │                                      │
  │  [Cancel — Keep it]                  │
  │  [Remove from bill only]             │  ← removes from bill, kitchen still makes it
  │  [Cancel from kitchen too]           │  ← sends cancellation to kitchen
  └──────────────────────────────────────┘
  ```

**Long-press item → Edit Sheet:**
Opens bottom sheet to change: variant, special instructions, quantity.
Cannot change the item itself — must delete and re-add.

---

## [SEND KOT] Button

This is the most critical UI element. It appears in TWO places:
1. Inline in cart section header (right side)
2. Sticky at bottom action bar

### Visual States:

**When pending items exist:**
```
┌──────────────────────────────────────┐
│  🔔  SEND KOT  ·  2 items           │
└──────────────────────────────────────┘
Background: #E23744 (red)
Pulsing red glow animation
Badge showing count of pending items
```

**When no pending items:**
```
┌──────────────────────────────────────┐
│  SEND KOT                           │
└──────────────────────────────────────┘
Background: #C7C7CC (gray, disabled)
No animation
```

### On Tap — Full Flow:

1. **Collect** all `order_items` WHERE `order_id = current` AND `kot_status = 'pending'`
2. **Show confirmation bottom sheet:**
   ```
   ┌────────────────────────────────────────────┐
   │  Send to Kitchen?                          │
   │                                            │
   │  Table T5  ·  KOT #2 (Add-On)             │
   │  2:45 PM                                   │
   │                                            │
   │  ────────────────────────────────────────  │
   │  ◉ Crispy Corn [Full]         ×1           │
   │  ● Garlic Naan                ×2           │
   │  ────────────────────────────────────────  │
   │                                            │
   │  [  CANCEL  ]    [  SEND TO KITCHEN →  ]   │
   └────────────────────────────────────────────┘
   ```
   - Header shows "KOT #1" if first send, "KOT #2 (Add-On)" if subsequent
   - Shows ALL pending items for final review
   - Waiter can swipe down or tap Cancel to go back and add more

3. **On confirm → call Supabase RPC `send_kot()`:**
   ```typescript
   const { data, error } = await supabase.rpc('send_kot', {
     p_order_id: orderId,
     p_waiter_id: waiter.id,
     p_restaurant_id: waiter.restaurantId
   });
   ```
   (See RPC definition in KOT Fix file)

4. **On success:**
   - Pending items in cart flip from yellow `⏳ PENDING` → blue `KOT SENT ✓`
   - New group section header appears: "KOT #2 · Sent at 2:45 PM"
   - [SEND KOT] button goes gray (disabled — no more pending)
   - Green success toast: **"🍳 KOT #2 sent! Add-On · 2 items"** (or #1 for first)
   - `realtime_events` INSERT triggers admin panel notification instantly

5. **On error:**
   - Red toast: "Failed to send KOT. Check connection."
   - Items remain in PENDING state
   - User can retry

---

## Menu Section

### Search Bar:
```
┌────────────────────────────────────────────┐
│  🔍  Search food, drinks...          [✕]   │
└────────────────────────────────────────────┘
```
- Real-time search, 200ms debounce
- Searches `menu_items.name` and `menu_items.description`
- Results replace the category/grid view
- [✕] button clears and restores normal view

### Category Tabs:
```
[🌿 Starters] [🍛 Mains] [🫓 Breads] [🍚 Rice] [🥤 Drinks] [🍨 Desserts]
```
- Horizontally scrollable
- Active tab: red bg, white text
- Tab shows emoji (if set in admin) + category name
- No item count (keeps UI clean for waiter)

### Item Grid (2 columns on phone, 3 on tablet):

```
┌──────────────────┐  ┌──────────────────┐
│  [image / color] │  │  [image / color] │
│  placeholder 60% │  │                  │
├──────────────────┤  ├──────────────────┤
│ ● Paneer Tikka   │  │ ◉ Chicken Tikka  │
│ ₹180             │  │ ₹200             │
│ [+ ADD]          │  │ [SELECT ▾]       │
└──────────────────┘  └──────────────────┘
```

- **Image**: if `image_url` set → show image with rounded-xl crop. If not → colored gradient square with first letter of item name in white
- **Item name**: 15px medium, max 2 lines, ellipsis
- **Price**: ₹XXX in bold. If has variants → shows lowest price: "from ₹120"
- **Type dot**: green ● (veg) / red ◉ (non-veg) / brown ● (egg) — top-left corner of image
- **Featured**: ⭐ badge top-right corner of card
- **Out of stock**: dark semi-transparent overlay, "SOLD OUT 🚫" text, not tappable
- **[+ ADD]**: green button if no variants (immediate add on tap)
- **[SELECT ▾]**: red button if has variants (opens variant sheet)

### Tapping Item (No Variants):
- IMMEDIATE add — no confirmation needed
- Brief `+1` float animation on item card
- Item appears in cart (or if already in cart: qty increments by 1)
- Cart total updates instantly
- Success haptic (if device supports)

### Tapping Item (Has Variants) — Variant Bottom Sheet:

```
┌───────────────────────────────────────────────┐
│  ──── (drag handle) ────                      │
│                                               │
│  ┌──────────────┐                             │
│  │  [item img]  │  Paneer Tikka               │
│  │              │  ● VEG                      │
│  └──────────────┘  Cottage cheese skewers...  │
│                                               │
│  ─────────────────────────────────────────    │
│  Choose Size:                                 │
│                                               │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Half      │  │  Full ✓    │  │  Party   │ │
│  │  ₹120      │  │  ₹180      │  │  ₹320    │ │
│  └────────────┘  └────────────┘  └──────────┘ │
│  (pill buttons, single-select, red when active)│
│                                               │
│  Quantity:                                    │
│  [−]  [  1  ]  [+]                            │
│                                               │
│  Special Instructions:                        │
│  ┌─────────────────────────────────────────┐  │
│  │ e.g. No onion, extra sauce, less spicy  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │     ADD TO ORDER  ·  ₹180  →            │  │
│  └─────────────────────────────────────────┘  │
│  (red button, full width, price updates live) │
└───────────────────────────────────────────────┘
```

- Swipe down or tap outside to dismiss without adding
- Price in [ADD TO ORDER] button updates as variant selection changes
- Default variant pre-selected (whichever has `is_default = true`)

---

## Bottom Action Bar (always sticky)

```
┌──────────────────────────────────────────────────┐
│  [Hold Order]   [SEND KOT (2)]   [Request Bill]  │
└──────────────────────────────────────────────────┘
```

- **[Hold Order]**: saves order, returns to table grid, table stays occupied (amber "On Hold" tag)
- **[SEND KOT (N)]**: same as cart button. Shows pending item count.
- **[Request Bill]**: sends bill request to admin. Disabled until at least 1 item is in order AND at least 1 KOT has been sent.

---

## More Options [⋮] Menu (top-right button):

Slides up as bottom sheet:
```
📝 Edit Guest Count
🔄 Transfer to Another Table
🗒️ Add / Edit Order Notes
🚩 Mark as Priority
📋 View KOT History
🖨️ Request Print (admin)
💬 Add Special Note for Kitchen
🗑️ Cancel Entire Order
```

**Transfer Table**: shows sheet with all available tables. Select → confirm → order moves.
**Mark as Priority**: `UPDATE orders SET is_priority = true`. Red "PRIORITY" banner appears on all views.
**View KOT History**: shows each `kot_batch` record: KOT number, time, items, who sent it.
**Cancel Order**: requires confirmation. If any KOT sent → requires reason. Sends cancellation realtime event to admin.

---

---

# SECTION 6 — THE KOT BATCH SYSTEM (COMPLETE FIX)

## This section is the core technical solution to the KOT add-on problem.

---

## The Problem, Precisely:

At 2:00 PM:
- Table 1 orders: 2× Paneer Tikka + 1× Crispy Corn
- Waiter sends KOT → all 3 items get `kot_batch = 1, kot_status = 'sent'`

At 2:30 PM:
- Same customer wants: +1 Crispy Corn
- Waiter adds it to the cart
- **THE BUG**: naive implementations increase qty of existing Crispy Corn from 1→2 on the SENT item
- This means there's now no "pending" item to send
- The [Send KOT] button is still disabled
- Kitchen has no idea about the extra item
- Bill is updated but kitchen doesn't know

## The Fix:

When a waiter adds an item that already exists in the order:
- **NEVER modify sent items (kot_batch > 0)**
- ALWAYS create a NEW `order_items` row with `kot_batch = 0` (pending)
- The old row stays exactly as it was

This gives us:
```
order_items table after add-on:
id | item_name     | qty | kot_batch | kot_status
----+---------------+-----+-----------+-----------
 1  | Crispy Corn   |  1  |     1     |   sent       ← original
 2  | Paneer Tikka  |  2  |     1     |   sent       ← original
 3  | Crispy Corn   |  1  |     0     |   pending    ← NEW ROW (the extra one)
```

Now [Send KOT] is enabled because item #3 has `kot_status = 'pending'`.

---

## Supabase RPC: `send_kot`

```sql
CREATE OR REPLACE FUNCTION send_kot(
  p_order_id     UUID,
  p_waiter_id    UUID,
  p_restaurant_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_batch_number  INT;
  v_kot_number    TEXT;
  v_item_count    INT;
  v_is_addon      BOOLEAN;
  v_today         TEXT;
  v_daily_count   INT;
  v_table_id      UUID;
  v_table_number  TEXT;
  v_waiter_name   TEXT;
  v_items_snap    JSONB;
  v_kot_batch_id  UUID;
BEGIN

  -- ── 1. Count pending items ───────────────────────────────────────────
  SELECT COUNT(*) INTO v_item_count
  FROM order_items
  WHERE order_id = p_order_id AND kot_status = 'pending';

  IF v_item_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending items to send');
  END IF;

  -- ── 2. Get next batch number for THIS order ──────────────────────────
  SELECT COALESCE(MAX(batch_number), 0) + 1
  INTO v_batch_number
  FROM kot_batches
  WHERE order_id = p_order_id;

  v_is_addon := v_batch_number > 1;

  -- ── 3. Generate KOT number (unique per restaurant per day) ───────────
  v_today := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO v_daily_count
  FROM kot_batches
  WHERE restaurant_id = p_restaurant_id
    AND sent_at::DATE = CURRENT_DATE;

  v_kot_number := 'KOT-' || v_today || '-' || LPAD(v_daily_count::TEXT, 3, '0');
  -- Results in: KOT-20260408-047

  -- ── 4. Get table and waiter info ─────────────────────────────────────
  SELECT o.table_id, t.number, s.name
  INTO v_table_id, v_table_number, v_waiter_name
  FROM orders o
  LEFT JOIN tables t ON t.id = o.table_id
  LEFT JOIN staff s ON s.id = p_waiter_id
  WHERE o.id = p_order_id;

  -- ── 5. Build items snapshot for KOT printing ─────────────────────────
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_name', oi.item_name,
      'variant_name', oi.variant_name,
      'qty', oi.qty,
      'special_instructions', oi.special_instructions,
      'item_type', mi.item_type
    )
  ) INTO v_items_snap
  FROM order_items oi
  LEFT JOIN menu_items mi ON mi.id = oi.item_id
  WHERE oi.order_id = p_order_id AND oi.kot_status = 'pending';

  -- ── 6. Insert kot_batches record ─────────────────────────────────────
  INSERT INTO kot_batches (
    restaurant_id, order_id, table_id, table_number,
    batch_number, kot_number, sent_by, sent_by_name,
    item_count, is_addon, items_snapshot
  ) VALUES (
    p_restaurant_id, p_order_id, v_table_id, v_table_number,
    v_batch_number, v_kot_number, p_waiter_id, v_waiter_name,
    v_item_count, v_is_addon, v_items_snap
  ) RETURNING id INTO v_kot_batch_id;

  -- ── 7. Update order_items: pending → sent ────────────────────────────
  UPDATE order_items
  SET
    kot_status  = 'sent',
    kot_batch   = v_batch_number,
    kot_sent_at = NOW()
  WHERE
    order_id   = p_order_id
    AND kot_status = 'pending';

  -- ── 8. Update order timestamp ────────────────────────────────────────
  UPDATE orders
  SET updated_at = NOW()
  WHERE id = p_order_id;

  -- ── 9. Insert realtime event for admin/kitchen ───────────────────────
  INSERT INTO realtime_events (
    restaurant_id, event_type, payload, triggered_by
  ) VALUES (
    p_restaurant_id,
    'kot_sent',
    jsonb_build_object(
      'order_id',      p_order_id,
      'table_id',      v_table_id,
      'table_number',  v_table_number,
      'kot_batch_id',  v_kot_batch_id,
      'kot_number',    v_kot_number,
      'batch_number',  v_batch_number,
      'is_addon',      v_is_addon,
      'item_count',    v_item_count,
      'waiter_name',   v_waiter_name
    ),
    p_waiter_id
  );

  -- ── 10. Return success ───────────────────────────────────────────────
  RETURN jsonb_build_object(
    'success',       true,
    'kot_number',    v_kot_number,
    'batch_number',  v_batch_number,
    'is_addon',      v_is_addon,
    'item_count',    v_item_count,
    'kot_batch_id',  v_kot_batch_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Frontend Hook: `useSendKOT`

```typescript
// hooks/useSendKOT.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useWaiterStore } from '@/stores/waiterStore';

export function useSendKOT(orderId: string) {
  const queryClient = useQueryClient();
  const waiter = useWaiterStore(s => s.profile);

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('send_kot', {
        p_order_id:      orderId,
        p_waiter_id:     waiter.id,
        p_restaurant_id: waiter.restaurantId,
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);
      return data as {
        success: boolean;
        kot_number: string;
        batch_number: number;
        is_addon: boolean;
        item_count: number;
        kot_batch_id: string;
      };
    },

    onMutate: async () => {
      // OPTIMISTIC UPDATE: immediately flip pending → sent in UI
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });

      const previousOrder = queryClient.getQueryData(['order', orderId]);

      queryClient.setQueryData(['order', orderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.kot_status === 'pending'
              ? { ...item, kot_status: 'sent', kot_batch: 999 } // temp batch
              : item
          ),
        };
      });

      return { previousOrder };
    },

    onSuccess: (data) => {
      // Refresh with real data from Supabase
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['kot_batches', orderId] });

      const msg = data.is_addon
        ? `🍳 Add-On KOT sent! ${data.item_count} item${data.item_count !== 1 ? 's' : ''}`
        : `🍳 KOT #${data.batch_number} sent! ${data.item_count} items to kitchen`;

      toast.success(msg, { duration: 3000 });
    },

    onError: (err, _, context) => {
      // Rollback optimistic update
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
      toast.error('Failed to send KOT. Please try again.');
      console.error('KOT send error:', err);
    },
  });
}
```

---

## Adding Items — The Smart Add Logic

```typescript
// hooks/useAddItemToOrder.ts

export function useAddItemToOrder(orderId: string) {
  const queryClient = useQueryClient();
  const waiter = useWaiterStore(s => s.profile);

  return useMutation({
    mutationFn: async (newItem: {
      itemId: string;
      variantId?: string;
      itemName: string;
      variantName?: string;
      unitPrice: number;
      qty: number;
      specialInstructions?: string;
    }) => {
      // CRITICAL RULE: Always INSERT a new row.
      // NEVER UPDATE an existing row's qty (that would break KOT tracking).
      // Even if same item+variant already in cart as sent → still INSERT new row.
      
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          order_id:             orderId,
          restaurant_id:        waiter.restaurantId,
          item_id:              newItem.itemId,
          variant_id:           newItem.variantId ?? null,
          item_name:            newItem.itemName,
          variant_name:         newItem.variantName ?? null,
          unit_price:           newItem.unitPrice,
          qty:                  newItem.qty,
          special_instructions: newItem.specialInstructions ?? null,
          kot_status:           'pending',  // ALWAYS start as pending
          kot_batch:            0,          // ALWAYS start as 0
          added_by:             waiter.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },

    onError: () => {
      toast.error('Failed to add item. Try again.');
    },
  });
}
```

---

---

# SECTION 7 — WAITER APP: MY ORDERS & ALERTS

## Build `/waiter/my-orders` and `/waiter/alerts`

---

## My Orders Screen

Shows all orders assigned to the logged-in waiter for today.

### Header Stats Bar:
```
Today:  12 orders  |  ₹8,420  |  67 items served
```

### Filter Tabs:
```
[All (12)]  [Active (3)]  [Bill Requested (1)]  [Done (8)]
```

### Order Card:
```
┌──────────────────────────────────────────────┐
│  Table T5            2:15 PM      🔵 Active  │
│  3 covers · 5 items · KOT Sent               │
│  Paneer Tikka, Crispy Corn, Garlic Naan...    │
│                                              │
│                            ₹640  [VIEW →]   │
└──────────────────────────────────────────────┘
```

Status colors:
- 🟡 Active: `background: #FFFAEE, border: #FF9500`
- 🔵 KOT Sent: `background: #EFF5FF, border: #007AFF`
- 🔴 Bill Requested: `background: #FFF0EE, border: #FF3B30`
- 🟢 Done: `background: #F0FFF8, border: #00A676`

Tapping card → navigates to that order screen.

### Takeaway Orders (shown differently):
```
┌──────────────────────────────────────────────┐
│  🥡 Takeaway                      2:30 PM   │
│  Token T-042  ·  Sharma Ji                   │
│  2 items  ·  ₹280       [KOT SENT ✓]        │
│                                    [VIEW →]  │
└──────────────────────────────────────────────┘
```

---

## Alerts Screen (`/waiter/alerts`)

Real-time notification feed for this waiter.

### Alert Types:

**✅ Kitchen Ready:**
```
┌──────────────────────────────────────────────┐
│  ✅ READY TO SERVE                 2:42 PM  │
│  Table T5 · Paneer Tikka [Full] ×2          │
│  (from KOT #1)                              │
│                      [MARK SERVED]  [Dismiss]│
└──────────────────────────────────────────────┘
```

**💰 Bill Request (from QR self-order):**
```
┌──────────────────────────────────────────────┐
│  💰 BILL REQUESTED                 3:15 PM  │
│  Table T8 is ready to pay                   │
│                           [GO TO TABLE]      │
└──────────────────────────────────────────────┘
```

**⏰ Reminder:**
```
┌──────────────────────────────────────────────┐
│  ⏰ REMINDER                       2:30 PM  │
│  Table T3 has been open 30 min — No KOT sent│
│                           [VIEW ORDER]       │
└──────────────────────────────────────────────┘
```

**🔵 KOT Confirmed:**
```
┌──────────────────────────────────────────────┐
│  🔵 KOT CONFIRMED                  2:15 PM  │
│  Kitchen received KOT #1 for Table T5        │
│                                   [Dismiss]  │
└──────────────────────────────────────────────┘
```

All alerts arrive via Supabase Realtime. Unread badge on bottom nav updates automatically.
[Clear All] button at top clears dismissed alerts.

---

---

# SECTION 8 — WAITER APP: BILL REQUEST & ORDER CLOSE

---

## Requesting Bill (from Order Screen)

Waiter taps **[Request Bill →]** in the bottom action bar.

**Confirmation Sheet:**
```
┌────────────────────────────────────────────┐
│  Request Bill for Table T5?                │
│                                            │
│  5 items  ·  Approx. ₹640                 │
│                                            │
│  This notifies the cashier/admin.          │
│  You won't be able to add more items       │
│  after requesting the bill.                │
│                                            │
│  [  CANCEL  ]    [  REQUEST BILL  →  ]    │
└────────────────────────────────────────────┘
```

On confirm:
1. `UPDATE orders SET status = 'bill_requested'`
2. INSERT `realtime_events` with type `bill_requested`
3. Admin panel: red bell notification, order row highlighted orange
4. Waiter's table grid: T5 card shows 💰 "BILL" orange banner
5. Toast: "Bill requested for Table T5 ✓"

After bill request:
- Waiter can still VIEW the order (read-only)
- Cannot add more items (add button disabled, shows "Bill requested — cannot modify")
- Cannot send another KOT

---

## After Admin Settles

When admin marks bill as settled in admin panel:
1. `UPDATE orders SET status = 'settled'`
2. `UPDATE tables SET status = 'available', current_order_id = null`
3. INSERT `realtime_events` (type: 'table_freed')

Waiter sees (via Realtime):
- If on order screen: auto-redirect to `/waiter/home` with toast "Table T5 settled ✓ — ₹640 collected"
- On table grid: T5 turns green (Available) instantly
- In My Orders: order moves to "Done" tab

---

---

# SECTION 9 — WAITER APP: PROFILE & SETTINGS

## Build `/waiter/profile`

---

```
┌────────────────────────────────────────┐
│                                        │
│         ┌──────────┐                  │
│         │    R     │  Ravi Kumar      │
│         │ (avatar) │  Waiter · W001   │
│         └──────────┘  On shift 10:02  │
│                                        │
├────────────────────────────────────────┤
│  Today's Summary                       │
│  ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │   12   │ │  ₹8420 │ │  ₹701 avg  │ │
│  │ Orders │ │Revenue │ │  per bill  │ │
│  └────────┘ └────────┘ └────────────┘ │
├────────────────────────────────────────┤
│                                        │
│  🔐 Change PIN              [→]        │
│  📶 Connection: Online ●               │
│  🌙 Dark Mode              [toggle]    │
│  📱 App Version: 1.0.0                 │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  [ ←  LOGOUT FROM SHIFT  ]             │
│                                        │
└────────────────────────────────────────┘
```

**Change PIN Flow:**
1. Sheet slides up: "Current PIN" → 4 boxes
2. "New PIN" → 4 boxes
3. "Confirm PIN" → 4 boxes
4. [SAVE NEW PIN]
5. Calls Supabase: `UPDATE staff SET pin = bcrypt(newPin) WHERE id = waiter.id`
6. Success toast: "PIN changed successfully"

**Connection Status:**
- 🟢 Online: Supabase Realtime connected, all sync active
- 🟡 Reconnecting: lost connection, auto-retry every 5s
- 🔴 Offline: no internet. Shows amber banner on all screens: "⚠️ Offline — changes will sync when connected"

**Logout:**
- Confirm: "End your shift?" [Cancel] [Logout]
- On confirm: clear Zustand store + localStorage
- Navigate to `/waiter/login`

---

---

# SECTION 10 — PWA & PERFORMANCE

---

## PWA Configuration

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'RestaurantOS Waiter',
        short_name: 'Waiter',
        description: 'Order management for restaurant waiters',
        theme_color: '#E23744',
        background_color: '#1C1C1E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/waiter/home',
        scope: '/waiter/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: { maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
```

## Install Prompt (show after 2nd visit):
```
┌────────────────────────────────────────────┐
│ 📲  Install Waiter App                     │
│     Works offline · Faster access          │
│                                            │
│  [Not Now]            [Install App →]      │
└────────────────────────────────────────────┘
```

## Performance Rules (implement all):
- React.lazy() for all route components
- Suspense boundaries with skeleton loaders
- Menu items loaded once on app init, cached in Zustand
- Table grid: virtualized if > 30 tables (react-virtual)
- Images: lazy load with IntersectionObserver
- Supabase queries: use .select() with specific columns only (not *)
- Debounce search: 200ms
- Optimistic UI for all mutations (add item, send KOT, update status)

---

---

# SECTION 11 — SEED DATA FOR TESTING

---

After all sections are built, create this seed data:

```
Restaurant: "Spice Garden"
City: Bengaluru
Activation Key: REST-2026-DEMO01
Plan: Pro

HQ Admin: hq@restaurantos.com / HQAdmin@123

Restaurant Admin: admin@spicegarden.com / Admin@1234
Admin Staff ID: ADMIN / PIN: 0000

Waiter Staff (all use Staff ID + PIN at /waiter/login):
  W001 / PIN: 1234  → Ravi Kumar (Waiter)
  W002 / PIN: 1234  → Priya Sharma (Waiter)
  W003 / PIN: 5678  → Amit Singh (Captain)
  K001 / PIN: 1111  → Rajesh Verma (Kitchen)
  C001 / PIN: 2222  → Meena Patel (Cashier)

Floors:
  Main Hall: T1–T10 (square, 4 seats each)
  Terrace: T11–T16 (round, 4 seats), T17–T18 (rectangle, 6 seats)

Menu:
  Starters (non-veg/veg):
    Paneer Tikka — Half ₹160 / Full ₹280 (veg)
    Crispy Corn — ₹180 (veg)
    Hara Bhara Kabab — ₹150 (veg)
    Chicken Tikka — Half ₹200 / Full ₹360 (nonveg)
    Fish Amritsari — ₹280 (nonveg)
  
  Mains:
    Dal Makhani — ₹220 (veg)
    Paneer Butter Masala — Half ₹200 / Full ₹320 (veg)
    Chicken Curry — ₹280 (nonveg)
    Butter Chicken — ₹300 (nonveg)
    Palak Paneer — ₹240 (veg)
  
  Breads:
    Butter Naan — ₹40 (veg)
    Garlic Naan — ₹50 (veg)
    Tandoori Roti — ₹30 (veg)
    Paratha — ₹60 (veg)
  
  Rice:
    Steamed Rice — ₹80
    Jeera Rice — ₹100
    Veg Biryani — ₹240
    Chicken Biryani — ₹280
  
  Beverages:
    Lassi — Sweet ₹80 / Salty ₹80 (veg)
    Fresh Lime Soda — ₹60 (veg)
    Masala Chai — ₹40 (veg)
    Cold Coffee — ₹120 (veg)
    Mango Lassi — ₹100 (veg)
  
  Desserts:
    Gulab Jamun — 1pc ₹60 / 2pc ₹100 (veg)
    Ice Cream — Vanilla/Chocolate/Mango ₹100 (veg)

Active sample orders:
  T3: Active, Waiter=Ravi. Items: 2× Paneer Tikka [Full] + 1× Garlic Naan (all KOT sent). Plus 1× Crispy Corn pending.
  T7: Bill Requested, Waiter=Priya. ₹540.
  T11: Settled (history only). ₹920.
```

---

*RestaurantOS Waiter App — Complete Build Prompt*
*Version 1.0 · April 2026 · All features · KOT bug fixed*
