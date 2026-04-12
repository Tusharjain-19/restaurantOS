import Dexie, { type Table } from 'dexie';

// ============ TYPE DEFINITIONS ============

export interface RestaurantProfile {
  id?: number;
  name: string;
  tagline?: string;
  cuisine_type: string;
  restaurant_type: 'fine_dining' | 'casual' | 'qsr' | 'cloud_kitchen' | 'cafe' | 'bar';
  logo_url?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  gstin?: string;
  fssai_license?: string;
  pan_number?: string;
  upi_id?: string;
  currency: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export interface Floor {
  id?: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface TableConfig {
  id?: number;
  floor_id: number;
  number: string;
  capacity: number;
  shape: 'square' | 'round' | 'rectangle';
  status: 'available' | 'occupied' | 'reserved' | 'dirty' | 'blocked';
  position_x?: number;
  position_y?: number;
  is_active: boolean;
}

export interface MenuCategory {
  id?: number;
  name: string;
  display_order: number;
  is_active: boolean;
  item_count: number;
  printer_id?: number;
}

export interface MenuVariant {
  id: string;
  name: string;
  price_modifier: number;
  modifier_type: 'add' | 'fixed';
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id?: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  item_type: 'veg' | 'non-veg' | 'egg' | 'vegan';
  is_available: boolean;
  is_hidden: boolean;
  hsn_code?: string;
  tax_rate: number;
  image_url?: string;
  preparation_time_mins?: number;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
  created_at: Date;
  updated_at: Date;
}

export interface TaxConfig {
  id?: number;
  name: string;
  rate: number;
  type: 'gst' | 'cgst' | 'sgst' | 'igst' | 'service_charge' | 'packaging' | 'delivery';
  is_active: boolean;
  is_inclusive: boolean;
}

export interface PaymentMethod {
  id?: number;
  name: string;
  type: 'cash' | 'upi' | 'card' | 'wallet' | 'credit' | 'complimentary' | 'gateway';
  is_active: boolean;
  display_order: number;
  gateway_config?: string;
}

export interface StaffMember {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  role: 'admin' | 'manager' | 'captain' | 'cashier' | 'kitchen' | 'delivery';
  pin: string;
  password_hash?: string;
  avatar_url?: string;
  is_active: boolean;
  shift?: 'morning' | 'afternoon' | 'night' | 'full';
  salary?: number;
  joining_date: Date;
  created_at: Date;
}

export interface Order {
  id?: number;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_id?: number;
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  guest_count?: number;
  status: 'active' | 'billed' | 'paid' | 'cancelled' | 'held';
  subtotal: number;
  discount_amount: number;
  discount_type?: 'percentage' | 'flat';
  tax_amount: number;
  service_charge: number;
  packaging_charge: number;
  delivery_charge: number;
  total: number;
  payment_method?: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  staff_id?: number;
  staff_name?: string;
  kot_count: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  billed_at?: Date;
  paid_at?: Date;
}

export interface OrderItem {
  id?: number;
  order_id: number;
  menu_item_id: number;
  name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  kot_number?: number;
  kot_status: 'pending' | 'sent' | 'in_prep' | 'ready' | 'served' | 'cancelled';
  is_addon: boolean;
  created_at: Date;
}

export interface KOT {
  id?: number;
  kot_number: number;
  order_id: number;
  table_number?: string;
  order_type: string;
  status: 'received' | 'in_preparation' | 'ready' | 'served' | 'cancelled';
  items: KOTItem[];
  staff_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface KOTItem {
  name: string;
  quantity: number;
  variant?: string;
  item_type: 'veg' | 'non-veg' | 'egg' | 'vegan';
  special_instructions?: string;
}

export interface Bill {
  id?: number;
  bill_number: string;
  order_id: number;
  table_number?: string;
  order_type: string;
  customer_name?: string;
  customer_phone?: string;
  items: BillItem[];
  subtotal: number;
  discount_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  service_charge: number;
  packaging_charge: number;
  delivery_charge: number;
  round_off: number;
  grand_total: number;
  payment_method: string;
  payment_details?: string;
  amount_tendered?: number;
  change_returned?: number;
  status: 'generated' | 'paid' | 'voided' | 'refunded';
  void_reason?: string;
  staff_name?: string;
  created_at: Date;
  paid_at?: Date;
}

export interface BillItem {
  name: string;
  variant?: string;
  quantity: number;
  rate: number;
  amount: number;
  tax_rate: number;
}

export interface Ingredient {
  id?: number;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_level: number;
  cost_per_unit: number;
  status: 'normal' | 'low' | 'out';
  batch_number?: string;
  expiry_date?: Date;
  last_purchased?: Date;
}

export interface Recipe {
  id?: number;
  menu_item_id: number;
  ingredients: RecipeIngredient[];
  food_cost: number;
  margin_percentage: number;
}

export interface RecipeIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface Vendor {
  id?: number;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  gstin?: string;
  outstanding_amount: number;
  last_order_date?: Date;
  is_active: boolean;
}

export interface PurchaseOrder {
  id?: number;
  po_number: string;
  vendor_id: number;
  vendor_name: string;
  items: PurchaseItem[];
  total_amount: number;
  status: 'draft' | 'ordered' | 'received' | 'partial' | 'cancelled';
  ordered_at?: Date;
  received_at?: Date;
  created_at: Date;
}

export interface PurchaseItem {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  received_qty?: number;
}

export interface WastageLog {
  id?: number;
  ingredient_id?: number;
  menu_item_id?: number;
  item_name: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: 'spoiled' | 'over_prepared' | 'dropped' | 'training' | 'expired' | 'other';
  notes?: string;
  staff_name?: string;
  created_at: Date;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  birthday?: Date;
  anniversary?: Date;
  address?: string;
  total_visits: number;
  total_spend: number;
  loyalty_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_blacklisted: boolean;
  notes?: string;
  last_visit?: Date;
  created_at: Date;
}

export interface Reservation {
  id?: number;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  table_id?: number;
  date: string;
  time: string;
  status: 'confirmed' | 'seated' | 'completed' | 'no_show' | 'cancelled';
  special_requests?: string;
  created_at: Date;
}

export interface WaitlistEntry {
  id?: number;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  estimated_wait: number;
  status: 'waiting' | 'notified' | 'seated' | 'left';
  notes?: string;
  created_at: Date;
}

export interface AuditLog {
  id?: number;
  action: string;
  module: string;
  details: string;
  staff_id?: number;
  staff_name?: string;
  timestamp: Date;
}

export interface PrinterConfig {
  id?: number;
  name: string;
  type: 'bill' | 'kot' | 'bar' | 'label';
  connection: 'usb' | 'lan' | 'bluetooth';
  ip_address?: string;
  port?: number;
  paper_width: '57mm' | '80mm';
  is_default: boolean;
  is_active: boolean;
  assigned_categories?: number[];
}

export interface AppSetting {
  id?: number;
  key: string;
  value: string;
  category: string;
}

// ============ DATABASE CLASS ============

class RestaurantDB extends Dexie {
  restaurant!: Table<RestaurantProfile>;
  floors!: Table<Floor>;
  restaurantTables!: Table<TableConfig>;
  menuCategories!: Table<MenuCategory>;
  menuItems!: Table<MenuItem>;
  taxConfig!: Table<TaxConfig>;
  paymentMethods!: Table<PaymentMethod>;
  staff!: Table<StaffMember>;
  orders!: Table<Order>;
  orderItems!: Table<OrderItem>;
  kots!: Table<KOT>;
  bills!: Table<Bill>;
  ingredients!: Table<Ingredient>;
  recipes!: Table<Recipe>;
  vendors!: Table<Vendor>;
  purchaseOrders!: Table<PurchaseOrder>;
  wastageLogs!: Table<WastageLog>;
  customers!: Table<Customer>;
  reservations!: Table<Reservation>;
  waitlist!: Table<WaitlistEntry>;
  auditLogs!: Table<AuditLog>;
  printers!: Table<PrinterConfig>;
  settings!: Table<AppSetting>;

  constructor() {
    super('RestaurantOS');

    this.version(1).stores({
      restaurant: '++id',
      floors: '++id, display_order',
      restaurantTables: '++id, floor_id, status',
      menuCategories: '++id, display_order',
      menuItems: '++id, category_id, item_type, is_available',
      taxConfig: '++id, type',
      paymentMethods: '++id, type, display_order',
      staff: '++id, role, pin, phone',
      orders: '++id, order_type, status, created_at, table_id',
      orderItems: '++id, order_id, menu_item_id, kot_status',
      kots: '++id, order_id, status, created_at',
      bills: '++id, order_id, status, created_at',
      ingredients: '++id, category, status',
      recipes: '++id, menu_item_id',
      vendors: '++id, category',
      purchaseOrders: '++id, vendor_id, status',
      wastageLogs: '++id, created_at',
      customers: '++id, phone, tier',
      reservations: '++id, date, status',
      waitlist: '++id, status, created_at',
      auditLogs: '++id, module, timestamp',
      printers: '++id, type',
      settings: '++id, key, category',
    });
  }
}

export const db = new RestaurantDB();

/**
 * Returns a structurally robust sequential ID based on daily context.
 * Useful for Orders, Bills, KOTs, and Daily Tokens.
 */
export const getNextSequence = async (type: 'order' | 'bill' | 'kot' | 'token') => {
  const today = new Date();
  const dateStr = String(today.getFullYear()).slice(2) + 
                  String(today.getMonth() + 1).padStart(2, '0') + 
                  String(today.getDate()).padStart(2, '0');
  
  return await db.transaction('rw', db.settings, async () => {
    let entry = await db.settings.where('key').equals('sequence_counters').first();
    let counters = entry ? JSON.parse(entry.value) : { date: dateStr, order: 0, bill: 0, kot: 0, token: 99 };
    
    // Reset if it's a new day
    if (counters.date !== dateStr) {
      counters = { date: dateStr, order: 0, bill: 0, kot: 0, token: 99 };
    }
    
    counters[type] = (counters[type] || 0) + 1;
    
    if (entry && entry.id) {
      await db.settings.update(entry.id, { value: JSON.stringify(counters) });
    } else {
      await db.settings.add({ key: 'sequence_counters', value: JSON.stringify(counters), category: 'system' });
    }
    
    return { dateStr, count: counters[type] };
  });
};

// ============ SEED DATA ============

export async function seedDatabase() {
  const restaurantCount = await db.restaurant.count();
  if (restaurantCount > 0) return; // Already seeded

  // Seed restaurant profile
  await db.restaurant.add({
    name: 'My Restaurant',
    cuisine_type: 'Multi-Cuisine',
    restaurant_type: 'casual',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Seed default admin
  await db.staff.add({
    name: 'Admin',
    phone: '0000000000',
    role: 'admin',
    pin: '1234',
    password_hash: 'admin123',
    is_active: true,
    shift: 'full',
    joining_date: new Date(),
    created_at: new Date(),
  });

  // Seed floors
  await db.floors.bulkAdd([
    { name: 'Main Hall', display_order: 0, is_active: true },
    { name: 'Terrace', display_order: 1, is_active: true },
    { name: 'AC Section', display_order: 2, is_active: true },
  ]);

  // Seed tables
  const tableSeeds: Omit<TableConfig, 'id'>[] = [];
  const floorIds = [1, 2, 3];
  const tableCounts = [8, 4, 3];
  let tableNum = 1;
  for (let fi = 0; fi < floorIds.length; fi++) {
    for (let ti = 0; ti < tableCounts[fi]; ti++) {
      tableSeeds.push({
        floor_id: floorIds[fi],
        number: `T${tableNum}`,
        capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
        shape: (['square', 'round', 'rectangle'] as const)[Math.floor(Math.random() * 3)],
        status: 'available',
        is_active: true,
      });
      tableNum++;
    }
  }
  await db.restaurantTables.bulkAdd(tableSeeds);

  // Seed menu categories
  await db.menuCategories.bulkAdd([
    { name: 'Starters', display_order: 0, is_active: true, item_count: 8 },
    { name: 'Main Course', display_order: 1, is_active: true, item_count: 12 },
    { name: 'Breads', display_order: 2, is_active: true, item_count: 6 },
    { name: 'Rice & Biryani', display_order: 3, is_active: true, item_count: 5 },
    { name: 'Beverages', display_order: 4, is_active: true, item_count: 8 },
    { name: 'Desserts', display_order: 5, is_active: true, item_count: 4 },
  ]);

  // Seed menu items
  const menuItemSeeds: Omit<MenuItem, 'id'>[] = [
    { category_id: 1, name: 'Paneer Tikka', price: 280, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, variants: [{ id: 'v1', name: 'Half', price_modifier: -80, modifier_type: 'add' }, { id: 'v2', name: 'Full', price_modifier: 0, modifier_type: 'add' }], created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Chicken Tikka', price: 320, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Veg Spring Roll', price: 180, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Fish Amritsari', price: 380, item_type: 'non-veg', is_available: false, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Hara Bhara Kebab', price: 220, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Tandoori Chicken', price: 350, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, variants: [{ id: 'v3', name: 'Half', price_modifier: -100, modifier_type: 'add' }, { id: 'v4', name: 'Full', price_modifier: 0, modifier_type: 'add' }], created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Mushroom Galouti', price: 260, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 1, name: 'Seekh Kebab', price: 300, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Paneer Butter Masala', price: 280, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Dal Tadka', price: 180, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Butter Chicken', price: 320, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Palak Paneer', price: 260, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Chicken Curry', price: 280, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Aloo Gobi', price: 180, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Mutton Rogan Josh', price: 420, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Mixed Veg', price: 200, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Kadai Paneer', price: 270, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Fish Curry', price: 360, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Chole Masala', price: 180, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 2, name: 'Egg Curry', price: 200, item_type: 'egg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Butter Naan', price: 60, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Garlic Naan', price: 70, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Roti', price: 30, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Laccha Paratha', price: 60, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Missi Roti', price: 50, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 3, name: 'Kulcha', price: 70, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 4, name: 'Jeera Rice', price: 150, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 4, name: 'Veg Biryani', price: 220, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 4, name: 'Chicken Biryani', price: 300, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 4, name: 'Mutton Biryani', price: 380, item_type: 'non-veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 4, name: 'Steamed Rice', price: 100, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Masala Chai', price: 40, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Fresh Lime Soda', price: 60, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Mango Lassi', price: 90, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Buttermilk', price: 50, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Cold Coffee', price: 120, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Mineral Water', price: 30, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Soft Drink', price: 50, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 5, name: 'Fresh Juice', price: 100, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 6, name: 'Gulab Jamun', price: 80, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 6, name: 'Rasmalai', price: 100, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
    { category_id: 6, name: 'Ice Cream', price: 120, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, variants: [{ id: 'v5', name: 'Vanilla', price_modifier: 0, modifier_type: 'add' }, { id: 'v6', name: 'Chocolate', price_modifier: 20, modifier_type: 'add' }, { id: 'v7', name: 'Butterscotch', price_modifier: 20, modifier_type: 'add' }], created_at: new Date(), updated_at: new Date() },
    { category_id: 6, name: 'Kheer', price: 90, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5, created_at: new Date(), updated_at: new Date() },
  ];
  await db.menuItems.bulkAdd(menuItemSeeds);

  // Seed tax config
  await db.taxConfig.bulkAdd([
    { name: 'GST 5%', rate: 5, type: 'gst', is_active: true, is_inclusive: false },
    { name: 'CGST 2.5%', rate: 2.5, type: 'cgst', is_active: true, is_inclusive: false },
    { name: 'SGST 2.5%', rate: 2.5, type: 'sgst', is_active: true, is_inclusive: false },
    { name: 'Service Charge', rate: 0, type: 'service_charge', is_active: false, is_inclusive: false },
    { name: 'Packaging Charge', rate: 0, type: 'packaging', is_active: false, is_inclusive: false },
  ]);

  // Seed payment methods
  await db.paymentMethods.bulkAdd([
    { name: 'Cash', type: 'cash', is_active: true, display_order: 0 },
    { name: 'UPI', type: 'upi', is_active: true, display_order: 1 },
    { name: 'Credit/Debit Card', type: 'card', is_active: true, display_order: 2 },
    { name: 'Digital Wallet', type: 'wallet', is_active: true, display_order: 3 },
    { name: 'Complimentary', type: 'complimentary', is_active: true, display_order: 4 },
  ]);

  // Seed ingredients
  await db.ingredients.bulkAdd([
    { name: 'Onions', category: 'vegetables', unit: 'kg', current_stock: 25, min_level: 10, cost_per_unit: 30, status: 'normal' },
    { name: 'Tomatoes', category: 'vegetables', unit: 'kg', current_stock: 8, min_level: 10, cost_per_unit: 40, status: 'low' },
    { name: 'Chicken', category: 'meat', unit: 'kg', current_stock: 15, min_level: 5, cost_per_unit: 220, status: 'normal' },
    { name: 'Paneer', category: 'dairy', unit: 'kg', current_stock: 3, min_level: 5, cost_per_unit: 320, status: 'low' },
    { name: 'Basmati Rice', category: 'grains', unit: 'kg', current_stock: 50, min_level: 20, cost_per_unit: 80, status: 'normal' },
    { name: 'Cooking Oil', category: 'other', unit: 'L', current_stock: 20, min_level: 10, cost_per_unit: 150, status: 'normal' },
    { name: 'Flour (Atta)', category: 'grains', unit: 'kg', current_stock: 30, min_level: 15, cost_per_unit: 45, status: 'normal' },
    { name: 'Butter', category: 'dairy', unit: 'kg', current_stock: 2, min_level: 3, cost_per_unit: 480, status: 'low' },
    { name: 'Cream', category: 'dairy', unit: 'L', current_stock: 5, min_level: 3, cost_per_unit: 200, status: 'normal' },
    { name: 'Mutton', category: 'meat', unit: 'kg', current_stock: 0, min_level: 3, cost_per_unit: 650, status: 'out' },
    { name: 'Ginger-Garlic Paste', category: 'spices', unit: 'kg', current_stock: 4, min_level: 2, cost_per_unit: 120, status: 'normal' },
    { name: 'Green Chillies', category: 'vegetables', unit: 'kg', current_stock: 1.5, min_level: 1, cost_per_unit: 60, status: 'normal' },
  ]);

  // Seed vendors
  await db.vendors.bulkAdd([
    { name: 'Fresh Farm Supplies', contact_person: 'Ravi Kumar', phone: '9876543210', category: 'Vegetables', outstanding_amount: 12500, is_active: true },
    { name: 'Delhi Meat House', contact_person: 'Imran Khan', phone: '9876543211', category: 'Meat', outstanding_amount: 28000, is_active: true },
    { name: 'Amul Distributors', contact_person: 'Suresh Patel', phone: '9876543212', category: 'Dairy', outstanding_amount: 8500, is_active: true },
    { name: 'Spice World Traders', contact_person: 'Geeta Sharma', phone: '9876543213', category: 'Spices', outstanding_amount: 0, is_active: true },
  ]);

  // Seed sample orders for dashboard
  const now = new Date();
  for (let i = 0; i < 15; i++) {
    const orderDate = new Date(now);
    orderDate.setHours(10 + Math.floor(Math.random() * 12));
    orderDate.setMinutes(Math.floor(Math.random() * 60));
    const subtotal = Math.floor(Math.random() * 2000) + 200;
    const tax = Math.floor(subtotal * 0.05);
    await db.orders.add({
      order_number: `ORD-${String(i + 1).padStart(4, '0')}`,
      order_type: (['dine_in', 'takeaway', 'delivery'] as const)[Math.floor(Math.random() * 3)],
      status: 'paid',
      subtotal,
      discount_amount: 0,
      tax_amount: tax,
      service_charge: 0,
      packaging_charge: 0,
      delivery_charge: 0,
      total: subtotal + tax,
      payment_method: ['Cash', 'UPI', 'Card'][Math.floor(Math.random() * 3)],
      payment_status: 'paid',
      kot_count: 1,
      created_at: orderDate,
      updated_at: orderDate,
      paid_at: orderDate,
    });
  }

  // Seed app settings
  await db.settings.bulkAdd([
    { key: 'bill_numbering', value: 'daily', category: 'billing' },
    { key: 'round_off', value: 'nearest_rupee', category: 'billing' },
    { key: 'service_charge_rate', value: '0', category: 'charges' },
    { key: 'packaging_charge', value: '0', category: 'charges' },
    { key: 'loyalty_points_per_100', value: '10', category: 'loyalty' },
    { key: 'session_timeout_minutes', value: '5', category: 'security' },
    { key: 'auto_kot', value: 'false', category: 'pos' },
    { key: 'bill_header_message', value: 'Thank you for dining with us!', category: 'billing' },
    { key: 'wifi_password', value: '', category: 'general' },
  ]);

  console.log('✅ Database seeded successfully');
}
