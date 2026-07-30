import { db } from './db';
import { supabase } from '@/integrations/supabase/client';

/**
 * Push a row (or rows) to a Supabase table, upserting on the `id` column.
 */
export const syncToCloud = async (tableName: string, data: any) => {
  const { error } = await (supabase as any)
    .from(tableName)
    .upsert(data, { onConflict: 'id' });

  if (error) console.error(`Sync error for ${tableName}:`, error);
  return !error;
};

/**
 * Pull all relevant data for the signed-in user's restaurant from the cloud
 * and mirror it into the local IndexedDB so the app can work offline.
 */
export const pullFromCloud = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('pullFromCloud: not signed in');
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const restaurantId = profile?.restaurant_id;
  if (!restaurantId) {
    console.warn('pullFromCloud: no restaurant linked to profile');
    return;
  }

  // Menu categories (scoped by restaurant)
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (categories) {
    await db.menuCategories.clear();
    await db.menuCategories.bulkAdd(categories);
  }

  // Menu items (scoped through categories)
  const categoryIds = (categories ?? []).map((c: any) => c.id);
  if (categoryIds.length) {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .in('category_id', categoryIds);

    if (menuItems) {
      await db.menuItems.clear();
      await db.menuItems.bulkAdd(menuItems);
    }
  } else {
    await db.menuItems.clear();
  }

  // Floors + tables
  const { data: floors } = await supabase
    .from('floors')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (floors) {
    await db.floors.clear();
    await db.floors.bulkAdd(floors);

    const floorIds = floors.map((f: any) => f.id);
    if (floorIds.length) {
      const { data: tableRows } = await supabase
        .from('tables')
        .select('*')
        .in('floor_id', floorIds);

      if (tableRows) {
        await db.restaurantTables.clear();
        await db.restaurantTables.bulkAdd(tableRows);
      }
    }
  }

  // Orders + order items
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (orders) {
    await db.orders.clear();
    await db.orders.bulkAdd(orders);

    const orderIds = orders.map((o: any) => o.id);
    if (orderIds.length) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (items) {
        await db.orderItems.clear();
        await db.orderItems.bulkAdd(items);
      }
    }
  }

  // Bills
  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (bills) {
    await db.bills.clear();
    await db.bills.bulkAdd(bills);
  }

  // Customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (customers) {
    await db.customers.clear();
    await db.customers.bulkAdd(customers);
  }

  console.log('✅ Cloud data synced to local device');
};
