// Centralized mock data for all modules

export const MOCK_FLOORS = [
  { id: 'f1', name: 'Main Hall', display_order: 0 },
];

export type MockTable = {
  id: string;
  floor_id: string;
  number: string;
  capacity: number;
  shape: 'square' | 'round' | 'rectangle';
  status: 'available' | 'occupied' | 'reserved' | 'dirty' | 'blocked';
  order_amount?: number;
  order_time?: string;
  reservation_name?: string;
  reservation_time?: string;
  waiter?: string;
};

export const MOCK_TABLES: MockTable[] = [
  { id: 't1', floor_id: 'f1', number: 'T1', capacity: 2, shape: 'square', status: 'available' },
  { id: 't2', floor_id: 'f1', number: 'T2', capacity: 4, shape: 'square', status: 'available' },
  { id: 't3', floor_id: 'f1', number: 'T3', capacity: 6, shape: 'rectangle', status: 'available' },
];

export type MockCategory = {
  id: string;
  name: string;
  type: 'veg' | 'non-veg' | 'both';
  item_count: number;
};

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'c1', name: 'Starters', type: 'both', item_count: 2 },
  { id: 'c2', name: 'Main Course', type: 'both', item_count: 2 },
];

export type MockMenuItem = {
  id: string;
  category_id: string;
  name: string;
  price: number;
  item_type: 'veg' | 'non-veg' | 'egg';
  is_available: boolean;
  tax_rate: number;
  variants?: { id: string; name: string; price_modifier: number; modifier_type: 'add' | 'fixed' }[];
};

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  { id: 'm1', category_id: 'c1', name: 'Paneer Tikka', price: 240, item_type: 'veg', is_available: true, tax_rate: 5,
    variants: [{ id: 'v1', name: 'Half', price_modifier: -60, modifier_type: 'add' }, { id: 'v2', name: 'Full', price_modifier: 0, modifier_type: 'add' }] },
  { id: 'm2', category_id: 'c1', name: 'Veg Spring Roll', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm3', category_id: 'c2', name: 'Paneer Butter Masala', price: 280, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm4', category_id: 'c2', name: 'Dal Tadka', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
];

export type OrderItem = {
  id: string;
  item_id: string;
  variant_id?: string;
  name: string;
  variant_name?: string;
  qty: number;
  unit_price: number;
  special_instructions?: string;
  kot_status: 'pending' | 'sent' | 'in_prep' | 'ready' | 'served';
  is_addon: boolean;
};

// Kitchen mock data
export type KitchenOrder = {
  id: string;
  table_number: string;
  order_type: string;
  kot_number: number;
  created_at: string;
  elapsed_minutes: number;
  status: 'new' | 'in_prep' | 'ready';
  is_priority: boolean;
  is_addon: boolean;
  items: {
    name: string;
    qty: number;
    variant?: string;
    item_type: 'veg' | 'non-veg';
    special_instructions?: string;
  }[];
};

export const MOCK_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: 'ko1', table_number: 'T2', order_type: 'Dine-In', kot_number: 10,
    created_at: '14:20', elapsed_minutes: 3, status: 'new', is_priority: false, is_addon: false,
    items: [
      { name: 'Paneer Tikka', qty: 1, variant: 'Full', item_type: 'veg' },
      { name: 'Dal Tadka', qty: 1, item_type: 'veg' },
    ],
  },
];

// Inventory mock
export const MOCK_INGREDIENTS = [
  { id: 'i1', name: 'Onions', category: 'vegetables', unit: 'kg', current_stock: 10, min_level: 5, cost_per_unit: 30, status: 'normal' as const },
  { id: 'i2', name: 'Paneer', category: 'dairy', unit: 'kg', current_stock: 2, min_level: 3, cost_per_unit: 320, status: 'low' as const },
];

export const MOCK_VENDORS = [
  { id: 'v1', name: 'Fresh Farm Supplies', contact: 'Ravi Kumar', phone: '9876543210', category: 'Vegetables', last_order: '2 days ago', outstanding: 0 },
];
