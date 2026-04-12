// Centralized mock data for all modules

export const MOCK_FLOORS = [
  { id: 'f1', name: 'Main Hall', display_order: 0 },
  { id: 'f2', name: 'Terrace', display_order: 1 },
  { id: 'f3', name: 'AC Section', display_order: 2 },
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
  { id: 't2', floor_id: 'f1', number: 'T2', capacity: 4, shape: 'square', status: 'occupied', order_amount: 860, order_time: '45m', waiter: 'Raj' },
  { id: 't3', floor_id: 'f1', number: 'T3', capacity: 4, shape: 'round', status: 'available' },
  { id: 't4', floor_id: 'f1', number: 'T4', capacity: 6, shape: 'rectangle', status: 'occupied', order_amount: 1240, order_time: '22m', waiter: 'Priya' },
  { id: 't5', floor_id: 'f1', number: 'T5', capacity: 2, shape: 'square', status: 'reserved', reservation_name: 'Sharma', reservation_time: '8:00 PM' },
  { id: 't6', floor_id: 'f1', number: 'T6', capacity: 4, shape: 'square', status: 'available' },
  { id: 't7', floor_id: 'f1', number: 'T7', capacity: 8, shape: 'rectangle', status: 'dirty' },
  { id: 't8', floor_id: 'f1', number: 'T8', capacity: 4, shape: 'round', status: 'available' },
  { id: 't9', floor_id: 'f2', number: 'T9', capacity: 4, shape: 'square', status: 'available' },
  { id: 't10', floor_id: 'f2', number: 'T10', capacity: 6, shape: 'rectangle', status: 'occupied', order_amount: 560, order_time: '12m', waiter: 'Amit' },
  { id: 't11', floor_id: 'f2', number: 'T11', capacity: 2, shape: 'round', status: 'available' },
  { id: 't12', floor_id: 'f2', number: 'T12', capacity: 4, shape: 'square', status: 'available' },
  { id: 't13', floor_id: 'f3', number: 'T13', capacity: 4, shape: 'square', status: 'occupied', order_amount: 1890, order_time: '55m', waiter: 'Raj' },
  { id: 't14', floor_id: 'f3', number: 'T14', capacity: 6, shape: 'rectangle', status: 'available' },
  { id: 't15', floor_id: 'f3', number: 'T15', capacity: 2, shape: 'round', status: 'reserved', reservation_name: 'Patel', reservation_time: '9:00 PM' },
];

export type MockCategory = {
  id: string;
  name: string;
  type: 'veg' | 'non-veg' | 'both';
  item_count: number;
};

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'c1', name: 'Starters', type: 'both', item_count: 8 },
  { id: 'c2', name: 'Main Course', type: 'both', item_count: 12 },
  { id: 'c3', name: 'Breads', type: 'veg', item_count: 6 },
  { id: 'c4', name: 'Rice & Biryani', type: 'both', item_count: 5 },
  { id: 'c5', name: 'Beverages', type: 'veg', item_count: 8 },
  { id: 'c6', name: 'Desserts', type: 'veg', item_count: 4 },
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
  { id: 'm1', category_id: 'c1', name: 'Paneer Tikka', price: 280, item_type: 'veg', is_available: true, tax_rate: 5,
    variants: [{ id: 'v1', name: 'Half', price_modifier: -80, modifier_type: 'add' }, { id: 'v2', name: 'Full', price_modifier: 0, modifier_type: 'add' }] },
  { id: 'm2', category_id: 'c1', name: 'Chicken Tikka', price: 320, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm3', category_id: 'c1', name: 'Veg Spring Roll', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm4', category_id: 'c1', name: 'Fish Amritsari', price: 380, item_type: 'non-veg', is_available: false, tax_rate: 5 },
  { id: 'm5', category_id: 'c1', name: 'Hara Bhara Kebab', price: 220, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm6', category_id: 'c1', name: 'Tandoori Chicken', price: 350, item_type: 'non-veg', is_available: true, tax_rate: 5,
    variants: [{ id: 'v3', name: 'Half', price_modifier: -100, modifier_type: 'add' }, { id: 'v4', name: 'Full', price_modifier: 0, modifier_type: 'add' }] },
  { id: 'm7', category_id: 'c1', name: 'Mushroom Galouti', price: 260, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm8', category_id: 'c1', name: 'Seekh Kebab', price: 300, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm9', category_id: 'c2', name: 'Paneer Butter Masala', price: 280, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm10', category_id: 'c2', name: 'Dal Tadka', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm11', category_id: 'c2', name: 'Butter Chicken', price: 320, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm12', category_id: 'c2', name: 'Palak Paneer', price: 260, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm13', category_id: 'c2', name: 'Chicken Curry', price: 280, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm14', category_id: 'c2', name: 'Aloo Gobi', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm15', category_id: 'c2', name: 'Mutton Rogan Josh', price: 420, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm16', category_id: 'c2', name: 'Mixed Veg', price: 200, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm17', category_id: 'c2', name: 'Kadai Paneer', price: 270, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm18', category_id: 'c2', name: 'Fish Curry', price: 360, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm19', category_id: 'c2', name: 'Chole Masala', price: 180, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm20', category_id: 'c2', name: 'Egg Curry', price: 200, item_type: 'egg', is_available: true, tax_rate: 5 },
  { id: 'm21', category_id: 'c3', name: 'Butter Naan', price: 60, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm22', category_id: 'c3', name: 'Garlic Naan', price: 70, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm23', category_id: 'c3', name: 'Roti', price: 30, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm24', category_id: 'c3', name: 'Laccha Paratha', price: 60, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm25', category_id: 'c3', name: 'Missi Roti', price: 50, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm26', category_id: 'c3', name: 'Kulcha', price: 70, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm27', category_id: 'c4', name: 'Jeera Rice', price: 150, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm28', category_id: 'c4', name: 'Veg Biryani', price: 220, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm29', category_id: 'c4', name: 'Chicken Biryani', price: 300, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm30', category_id: 'c4', name: 'Mutton Biryani', price: 380, item_type: 'non-veg', is_available: true, tax_rate: 5 },
  { id: 'm31', category_id: 'c4', name: 'Steamed Rice', price: 100, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm32', category_id: 'c5', name: 'Masala Chai', price: 40, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm33', category_id: 'c5', name: 'Fresh Lime Soda', price: 60, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm34', category_id: 'c5', name: 'Mango Lassi', price: 90, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm35', category_id: 'c5', name: 'Buttermilk', price: 50, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm36', category_id: 'c5', name: 'Cold Coffee', price: 120, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm37', category_id: 'c5', name: 'Mineral Water', price: 30, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm38', category_id: 'c5', name: 'Soft Drink', price: 50, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm39', category_id: 'c5', name: 'Fresh Juice', price: 100, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm40', category_id: 'c6', name: 'Gulab Jamun', price: 80, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm41', category_id: 'c6', name: 'Rasmalai', price: 100, item_type: 'veg', is_available: true, tax_rate: 5 },
  { id: 'm42', category_id: 'c6', name: 'Ice Cream', price: 120, item_type: 'veg', is_available: true, tax_rate: 5,
    variants: [{ id: 'v5', name: 'Vanilla', price_modifier: 0, modifier_type: 'add' }, { id: 'v6', name: 'Chocolate', price_modifier: 20, modifier_type: 'add' }, { id: 'v7', name: 'Butterscotch', price_modifier: 20, modifier_type: 'add' }] },
  { id: 'm43', category_id: 'c6', name: 'Kheer', price: 90, item_type: 'veg', is_available: true, tax_rate: 5 },
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
    id: 'ko1', table_number: 'T2', order_type: 'Dine-In', kot_number: 45,
    created_at: '14:20', elapsed_minutes: 12, status: 'new', is_priority: false, is_addon: false,
    items: [
      { name: 'Paneer Tikka', qty: 2, variant: 'Full', item_type: 'veg' },
      { name: 'Dal Tadka', qty: 1, item_type: 'veg' },
      { name: 'Butter Naan', qty: 4, item_type: 'veg' },
    ],
  },
  {
    id: 'ko2', table_number: 'T4', order_type: 'Dine-In', kot_number: 46,
    created_at: '14:25', elapsed_minutes: 7, status: 'in_prep', is_priority: false, is_addon: false,
    items: [
      { name: 'Butter Chicken', qty: 1, item_type: 'non-veg' },
      { name: 'Chicken Biryani', qty: 2, item_type: 'non-veg', special_instructions: 'Less spicy' },
      { name: 'Raita', qty: 1, item_type: 'veg' },
    ],
  },
  {
    id: 'ko3', table_number: 'T13', order_type: 'Dine-In', kot_number: 47,
    created_at: '14:28', elapsed_minutes: 4, status: 'new', is_priority: true, is_addon: false,
    items: [
      { name: 'Paneer Butter Masala', qty: 1, item_type: 'veg', special_instructions: 'No onion, no garlic' },
      { name: 'Garlic Naan', qty: 3, item_type: 'veg' },
    ],
  },
  {
    id: 'ko4', table_number: 'TKW-1', order_type: 'Takeaway', kot_number: 48,
    created_at: '14:30', elapsed_minutes: 2, status: 'new', is_priority: false, is_addon: false,
    items: [
      { name: 'Chicken Biryani', qty: 1, item_type: 'non-veg' },
      { name: 'Seekh Kebab', qty: 1, item_type: 'non-veg' },
    ],
  },
  {
    id: 'ko5', table_number: 'T2', order_type: 'Dine-In', kot_number: 49,
    created_at: '14:31', elapsed_minutes: 1, status: 'new', is_priority: false, is_addon: true,
    items: [
      { name: 'Gulab Jamun', qty: 2, item_type: 'veg' },
      { name: 'Masala Chai', qty: 2, item_type: 'veg' },
    ],
  },
  {
    id: 'ko6', table_number: 'T10', order_type: 'Dine-In', kot_number: 44,
    created_at: '14:10', elapsed_minutes: 22, status: 'in_prep', is_priority: false, is_addon: false,
    items: [
      { name: 'Mutton Rogan Josh', qty: 1, item_type: 'non-veg' },
      { name: 'Laccha Paratha', qty: 3, item_type: 'veg' },
      { name: 'Veg Biryani', qty: 1, item_type: 'veg' },
    ],
  },
  {
    id: 'ko7', table_number: 'DEL-3', order_type: 'Delivery', kot_number: 43,
    created_at: '14:05', elapsed_minutes: 27, status: 'ready', is_priority: false, is_addon: false,
    items: [
      { name: 'Chicken Curry', qty: 2, item_type: 'non-veg' },
      { name: 'Steamed Rice', qty: 2, item_type: 'veg' },
      { name: 'Roti', qty: 6, item_type: 'veg' },
    ],
  },
];

// Inventory mock
export const MOCK_INGREDIENTS = [
  { id: 'i1', name: 'Onions', category: 'vegetables', unit: 'kg', current_stock: 25, min_level: 10, cost_per_unit: 30, status: 'normal' as const },
  { id: 'i2', name: 'Tomatoes', category: 'vegetables', unit: 'kg', current_stock: 8, min_level: 10, cost_per_unit: 40, status: 'low' as const },
  { id: 'i3', name: 'Chicken', category: 'meat', unit: 'kg', current_stock: 15, min_level: 5, cost_per_unit: 220, status: 'normal' as const },
  { id: 'i4', name: 'Paneer', category: 'dairy', unit: 'kg', current_stock: 3, min_level: 5, cost_per_unit: 320, status: 'low' as const },
  { id: 'i5', name: 'Basmati Rice', category: 'grains', unit: 'kg', current_stock: 50, min_level: 20, cost_per_unit: 80, status: 'normal' as const },
  { id: 'i6', name: 'Cooking Oil', category: 'other', unit: 'L', current_stock: 20, min_level: 10, cost_per_unit: 150, status: 'normal' as const },
  { id: 'i7', name: 'Flour (Atta)', category: 'grains', unit: 'kg', current_stock: 30, min_level: 15, cost_per_unit: 45, status: 'normal' as const },
  { id: 'i8', name: 'Butter', category: 'dairy', unit: 'kg', current_stock: 2, min_level: 3, cost_per_unit: 480, status: 'low' as const },
  { id: 'i9', name: 'Cream', category: 'dairy', unit: 'L', current_stock: 5, min_level: 3, cost_per_unit: 200, status: 'normal' as const },
  { id: 'i10', name: 'Mutton', category: 'meat', unit: 'kg', current_stock: 0, min_level: 3, cost_per_unit: 650, status: 'out' as const },
  { id: 'i11', name: 'Ginger-Garlic Paste', category: 'spices', unit: 'kg', current_stock: 4, min_level: 2, cost_per_unit: 120, status: 'normal' as const },
  { id: 'i12', name: 'Green Chillies', category: 'vegetables', unit: 'kg', current_stock: 1.5, min_level: 1, cost_per_unit: 60, status: 'normal' as const },
];

export const MOCK_VENDORS = [
  { id: 'v1', name: 'Fresh Farm Supplies', contact: 'Ravi Kumar', phone: '9876543210', category: 'Vegetables', last_order: '2 days ago', outstanding: 12500 },
  { id: 'v2', name: 'Delhi Meat House', contact: 'Imran Khan', phone: '9876543211', category: 'Meat', last_order: '1 day ago', outstanding: 28000 },
  { id: 'v3', name: 'Amul Distributors', contact: 'Suresh Patel', phone: '9876543212', category: 'Dairy', last_order: '3 days ago', outstanding: 8500 },
  { id: 'v4', name: 'Spice World Traders', contact: 'Geeta Sharma', phone: '9876543213', category: 'Spices', last_order: '1 week ago', outstanding: 0 },
];
