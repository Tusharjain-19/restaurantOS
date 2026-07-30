import Dexie, { type Table } from 'dexie';

// Local offline mirror of cloud data using IndexedDB (via Dexie)
class RestaurantDB extends Dexie {
  menuItems!: Table<any, string>;
  menuCategories!: Table<any, string>;
  orders!: Table<any, string>;
  orderItems!: Table<any, string>;
  bills!: Table<any, string>;
  customers!: Table<any, string>;
  restaurantTables!: Table<any, string>;
  floors!: Table<any, string>;
  printers!: Table<any, string>;

  constructor() {
    super('RestaurantOS');
    this.version(2).stores({
      menuItems: 'id, category_id, name',
      menuCategories: 'id, restaurant_id, name',
      orders: 'id, restaurant_id, status, created_at',
      orderItems: 'id, order_id, item_id',
      bills: 'id, restaurant_id, status, created_at',
      customers: 'id, restaurant_id, phone, name',
      restaurantTables: 'id, floor_id, number',
      floors: 'id, restaurant_id, name',
      printers: 'id, restaurant_id, name, type',
    });
  }
}

export const db = new RestaurantDB();
