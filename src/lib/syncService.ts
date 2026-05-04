/**
 * syncService.ts
 * ──────────────────────────────────────────────
 * Two-way sync between local Dexie DB and Supabase cloud.
 *
 * On Login  → pull cloud data into local Dexie (so old sales, menu etc. appear)
 * On Save   → push new/updated records to Supabase (so data survives re-login)
 * ──────────────────────────────────────────────
 */

import { supabase } from './supabase';
import { db, type Order, type Bill, type KOT, type MenuItem, type MenuCategory,
         type Floor, type TableConfig, type StaffMember, type Ingredient,
         type Vendor, type PurchaseOrder, type Customer, type Reservation,
         type WastageLog, type PaymentMethod, type TaxConfig, type AppSetting,
         type RestaurantProfile } from './db';
import { toast } from 'sonner';

// ─── helpers ──────────────────────────────────

let _restaurantId: string | null = null;

/** Cache the restaurant_id for the session */
export async function getCloudRestaurantId(): Promise<string | null> {
  if (_restaurantId) return _restaurantId;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('user_id', user.id)
      .single();
    _restaurantId = data?.restaurant_id ?? null;
    return _restaurantId;
  } catch {
    return null;
  }
}

export function clearCachedRestaurantId() {
  _restaurantId = null;
}

// ─── PUSH: Local → Cloud ─────────────────────

/** Push a single order to Supabase */
export async function pushOrder(order: Order) {
  const rid = await getCloudRestaurantId();
  if (!rid) return;
  try {
    await supabase.from('orders').upsert({
      restaurant_id: rid,
      order_type: order.order_type,
      table_id: order.table_id || null,
      status: mapOrderStatus(order.status),
      guest_count: order.guest_count || 1,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.delivery_address,
      token_number: null,
      is_priority: false,
      created_at: order.created_at,
      updated_at: order.updated_at,
      // Store extended data in a metadata column or separate local fields
    });
  } catch (e) {
    console.error('[Sync] Push order failed:', e);
  }
}

/** Push a bill to Supabase */
export async function pushBill(bill: Bill) {
  const rid = await getCloudRestaurantId();
  if (!rid) return;
  try {
    await supabase.from('bills').upsert({
      restaurant_id: rid,
      bill_number: bill.bill_number,
      bill_type: 'standard',
      subtotal: bill.subtotal,
      discount_amount: bill.discount_amount,
      taxable_amount: bill.subtotal - bill.discount_amount,
      cgst: bill.cgst,
      sgst: bill.sgst,
      service_charge: bill.service_charge,
      packaging_charge: bill.packaging_charge,
      round_off: bill.round_off,
      grand_total: bill.grand_total,
      status: bill.status === 'paid' ? 'settled' : 'draft',
      settled_at: bill.paid_at,
      created_at: bill.created_at,
    });
  } catch (e) {
    console.error('[Sync] Push bill failed:', e);
  }
}

/** Push a KOT to Supabase */
export async function pushKOT(kot: KOT) {
  const rid = await getCloudRestaurantId();
  if (!rid) return;
  try {
    await supabase.from('kots').upsert({
      restaurant_id: rid,
      kot_number: kot.kot_number,
      table_number: kot.table_number,
      order_type: kot.order_type,
      status: kot.status,
      items: kot.items,
      staff_name: kot.staff_name,
      created_at: kot.created_at,
      updated_at: kot.updated_at,
    });
  } catch (e) {
    console.error('[Sync] Push KOT failed:', e);
  }
}

/** Push menu categories to Supabase */
export async function pushMenuCategories(categories: MenuCategory[]) {
  const rid = await getCloudRestaurantId();
  if (!rid) return;
  try {
    const rows = categories.map(c => ({
      restaurant_id: rid,
      name: c.name,
      display_order: c.display_order,
      is_active: c.is_active,
    }));
    await supabase.from('menu_categories').upsert(rows);
  } catch (e) {
    console.error('[Sync] Push categories failed:', e);
  }
}

/** Push menu items to Supabase */
export async function pushMenuItems(items: MenuItem[]) {
  const rid = await getCloudRestaurantId();
  if (!rid) return;
  try {
    // We need cloud category IDs — for now push to a mapping
    for (const item of items) {
      await supabase.from('menu_items').upsert({
        name: item.name,
        description: item.description,
        price: item.price,
        item_type: item.item_type,
        is_available: item.is_available,
        hsn_code: item.hsn_code,
        tax_rate: item.tax_rate,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
    }
  } catch (e) {
    console.error('[Sync] Push menu items failed:', e);
  }
}

// ─── PULL: Cloud → Local ─────────────────────

/** Full pull of all restaurant data from Supabase into Dexie */
export async function pullAllData(): Promise<boolean> {
  const rid = await getCloudRestaurantId();
  if (!rid) {
    console.warn('[Sync] No restaurant_id found, skipping pull');
    return false;
  }

  try {
    console.log('[Sync] Pulling cloud data for restaurant:', rid);

    // 1. Restaurant profile
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', rid)
      .single();

    if (restaurant) {
      const existing = await db.restaurant.toCollection().first();
      const profile: RestaurantProfile = {
        name: restaurant.name || 'My Restaurant',
        cuisine_type: 'Multi-Cuisine',
        restaurant_type: (restaurant.type?.toLowerCase() as any) || 'casual',
        logo_url: restaurant.logo_url,
        address: restaurant.address_1 || '',
        city: restaurant.city || '',
        state: restaurant.state || '',
        pincode: restaurant.pin || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website,
        gstin: restaurant.gstin,
        fssai_license: restaurant.fssai,
        pan_number: restaurant.pan,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        created_at: new Date(restaurant.created_at),
        updated_at: new Date(restaurant.updated_at),
      };
      if (existing?.id) {
        await db.restaurant.update(existing.id, profile);
      } else {
        await db.restaurant.add(profile);
      }
    }

    // 2. Floors
    const { data: floors } = await supabase
      .from('floors')
      .select('*')
      .eq('restaurant_id', rid)
      .order('display_order');

    if (floors && floors.length > 0) {
      await db.floors.clear();
      await db.floors.bulkAdd(floors.map((f: any) => ({
        name: f.name,
        display_order: f.display_order || 0,
        is_active: true,
      })));
    }

    // 3. Tables
    const { data: tables } = await supabase
      .from('tables')
      .select('*, floor:floors(name, display_order)')
      .eq('floors.restaurant_id', rid);

    if (tables && tables.length > 0) {
      const localFloors = await db.floors.toArray();
      await db.restaurantTables.clear();
      for (const t of tables) {
        const floorMatch = localFloors.find(f => f.name === t.floor?.name);
        if (floorMatch) {
          await db.restaurantTables.add({
            floor_id: floorMatch.id!,
            number: t.number,
            capacity: t.capacity || 4,
            shape: 'square',
            status: t.status || 'available',
            is_active: true,
          });
        }
      }
    }

    // 4. Menu categories
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', rid)
      .order('display_order');

    if (categories && categories.length > 0) {
      await db.menuCategories.clear();
      await db.menuCategories.bulkAdd(categories.map((c: any) => ({
        name: c.name,
        display_order: c.display_order || 0,
        is_active: c.is_active !== false,
        item_count: 0,
      })));
    }

    // 5. Menu items
    const { data: cloudMenuItems } = await supabase
      .from('menu_items')
      .select('*, category:menu_categories(name)')
      .eq('menu_categories.restaurant_id', rid);

    if (cloudMenuItems && cloudMenuItems.length > 0) {
      const localCats = await db.menuCategories.toArray();
      await db.menuItems.clear();
      for (const item of cloudMenuItems) {
        const catMatch = localCats.find(c => c.name === item.category?.name);
        if (catMatch) {
          await db.menuItems.add({
            category_id: catMatch.id!,
            name: item.name,
            description: item.description,
            price: Number(item.price) || 0,
            item_type: item.item_type || 'veg',
            is_available: item.is_available !== false,
            is_hidden: false,
            tax_rate: Number(item.tax_rate) || 5,
            hsn_code: item.hsn_code,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
          });
          // Update item count on category
          await db.menuCategories.update(catMatch.id!, {
            item_count: (catMatch.item_count || 0) + 1,
          });
        }
      }
    }

    // 6. Orders (historical — sales data)
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', rid)
      .order('created_at', { ascending: false })
      .limit(500);

    if (orders && orders.length > 0) {
      // Merge — don't clear existing local orders not yet synced
      for (const o of orders) {
        const exists = await db.orders
          .where('order_number')
          .equals(o.token_number ? `ORD-${o.token_number}` : `CLOUD-${o.id}`)
          .first();
        if (!exists) {
          await db.orders.add({
            order_number: o.token_number ? `ORD-${o.token_number}` : `CLOUD-${o.id.slice(0, 8)}`,
            order_type: o.order_type || 'dine_in',
            customer_name: o.customer_name,
            customer_phone: o.customer_phone,
            delivery_address: o.customer_address,
            guest_count: o.guest_count || 1,
            status: mapCloudOrderStatus(o.status),
            subtotal: 0,
            discount_amount: 0,
            tax_amount: 0,
            service_charge: 0,
            packaging_charge: 0,
            delivery_charge: 0,
            total: 0,
            payment_status: o.status === 'paid' ? 'paid' : 'pending',
            kot_count: 0,
            created_at: new Date(o.created_at),
            updated_at: new Date(o.updated_at),
          });
        }
      }
    }

    // 7. Bills (historical — sales reports)
    const { data: bills } = await supabase
      .from('bills')
      .select('*')
      .eq('restaurant_id', rid)
      .order('created_at', { ascending: false })
      .limit(500);

    if (bills && bills.length > 0) {
      for (const b of bills) {
        const exists = await db.bills
          .where('bill_number')
          .equals(b.bill_number || `CLOUD-${b.id.slice(0, 8)}`)
          .first();
        if (!exists) {
          await db.bills.add({
            bill_number: b.bill_number || `BL-${b.id.slice(0, 8)}`,
            order_id: 0,
            table_number: '',
            order_type: 'dine_in',
            items: [],
            subtotal: Number(b.subtotal) || 0,
            discount_amount: Number(b.discount_amount) || 0,
            cgst: Number(b.cgst) || 0,
            sgst: Number(b.sgst) || 0,
            igst: 0,
            service_charge: Number(b.service_charge) || 0,
            packaging_charge: Number(b.packaging_charge) || 0,
            delivery_charge: 0,
            round_off: Number(b.round_off) || 0,
            grand_total: Number(b.grand_total) || 0,
            payment_method: 'cash',
            status: b.status === 'settled' ? 'paid' : b.status === 'void' ? 'voided' : 'generated',
            created_at: new Date(b.created_at),
            paid_at: b.settled_at ? new Date(b.settled_at) : undefined,
          });
        }
      }
    }

    // 8. Staff
    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('restaurant_id', rid);

    if (staffData && staffData.length > 0) {
      // Merge cloud staff with local
      for (const s of staffData) {
        const existingStaff = await db.staff.where('phone').equals(s.phone || '').first();
        if (!existingStaff) {
          await db.staff.add({
            name: s.name,
            email: s.email,
            phone: s.phone || '',
            role: s.role || 'cashier',
            pin: s.pin || '0000',
            password_hash: s.password_hash,
            avatar_url: s.avatar_url,
            is_active: s.is_active !== false,
            shift: s.shift || 'full',
            salary: s.salary ? Number(s.salary) : undefined,
            joining_date: s.joining_date ? new Date(s.joining_date) : new Date(),
            created_at: new Date(s.created_at),
          });
        }
      }
    }

    // 9. Ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', rid);

    if (ingredients && ingredients.length > 0) {
      const existingIngredients = await db.ingredients.toArray();
      for (const ing of ingredients) {
        const exists = existingIngredients.find(e => e.name === ing.name);
        if (!exists) {
          await db.ingredients.add({
            name: ing.name,
            category: ing.category || 'other',
            unit: ing.unit || 'kg',
            current_stock: Number(ing.current_stock) || 0,
            min_level: Number(ing.min_level) || 0,
            cost_per_unit: Number(ing.cost_per_unit) || 0,
            status: Number(ing.current_stock) <= Number(ing.min_level) ? 'low' : 'normal',
          });
        }
      }
    }

    // 10. Customers
    const { data: cloudCustomers } = await supabase
      .from('customers')
      .select('*')
      .eq('restaurant_id', rid);

    if (cloudCustomers && cloudCustomers.length > 0) {
      for (const c of cloudCustomers) {
        const exists = await db.customers.where('phone').equals(c.phone || '').first();
        if (!exists && c.phone) {
          await db.customers.add({
            name: c.name,
            phone: c.phone,
            email: c.email,
            birthday: c.birthday ? new Date(c.birthday) : undefined,
            total_visits: c.total_visits || 0,
            total_spend: Number(c.total_spent) || 0,
            loyalty_points: c.total_points || 0,
            tier: c.tier || 'bronze',
            is_blacklisted: false,
            created_at: new Date(c.created_at),
          });
        }
      }
    }

    console.log('[Sync] ✅ Cloud data pulled successfully');
    return true;
  } catch (error) {
    console.error('[Sync] Pull failed:', error);
    return false;
  }
}

/** Push ALL local data to cloud (call after major operations) */
export async function pushAllData(): Promise<boolean> {
  const rid = await getCloudRestaurantId();
  if (!rid) return false;

  try {
    // Push orders
    const orders = await db.orders.toArray();
    for (const order of orders) {
      await pushOrder(order);
    }

    // Push bills
    const bills = await db.bills.toArray();
    for (const bill of bills) {
      await pushBill(bill);
    }

    // Push KOTs
    const kots = await db.kots.toArray();
    for (const kot of kots) {
      await pushKOT(kot);
    }

    console.log('[Sync] ✅ Local data pushed to cloud');
    return true;
  } catch (error) {
    console.error('[Sync] Push all failed:', error);
    return false;
  }
}

/** Background sync — call periodically or on key events */
export async function syncNow(): Promise<void> {
  const rid = await getCloudRestaurantId();
  if (!rid) return;

  try {
    await pushAllData();
    await pullAllData();
  } catch (e) {
    console.error('[Sync] Background sync failed:', e);
  }
}

// ─── Status helpers ──────────────────────────

function mapOrderStatus(localStatus: string): string {
  switch (localStatus) {
    case 'active': return 'active';
    case 'billed': return 'billed';
    case 'paid': return 'paid';
    case 'cancelled': return 'cancelled';
    case 'held': return 'pending';
    default: return 'pending';
  }
}

function mapCloudOrderStatus(cloudStatus: string): 'active' | 'billed' | 'paid' | 'cancelled' | 'held' {
  switch (cloudStatus) {
    case 'active': return 'active';
    case 'kot_sent': return 'active';
    case 'billed': return 'billed';
    case 'paid': return 'paid';
    case 'cancelled': return 'cancelled';
    case 'pending': return 'held';
    default: return 'active';
  }
}
