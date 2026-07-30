import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  MOCK_FLOORS,
  MOCK_TABLES,
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  type MockTable,
  type MockCategory,
  type MockMenuItem,
} from '@/lib/mock-data';
import { toast } from 'sonner';
import { db } from '@/lib/db';

// Helper to check if a database table returns no data
const isEmpty = (arr: any) => !arr || arr.length === 0;

export function useRestaurant(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      if (restaurantId === 'guest-restaurant-id') {
        const local = localStorage.getItem('guest_restaurant_profile');
        const defaultProfile = {
          id: 'guest-restaurant-id',
          name: 'Ninja Cafe & Restaurant',
          phone: '+91 98765 43210',
          email: 'hello@ninjacafe.com',
          website: 'www.ninjacafe.com',
          address_1: '123 Gourmet Street',
          address_2: 'Food Park, Sector 5',
          city: 'Bengaluru',
          state: 'Karnataka',
          pin: '560001',
          gstin: '29AAAAA0000A1Z5',
          fssai: '12345678901234',
        };
        return local ? { ...defaultProfile, ...JSON.parse(local) } : defaultProfile;
      }
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useFloors(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['floors', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return MOCK_FLOORS;
      if (restaurantId === 'guest-restaurant-id') {
        const local = await db.floors.toArray();
        if (isEmpty(local)) {
          const prepop = MOCK_FLOORS.map(f => ({ ...f, restaurant_id: restaurantId }));
          await db.floors.bulkAdd(prepop);
          return prepop;
        }
        return local;
      }
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (isEmpty(data)) {
        return MOCK_FLOORS.map(f => ({ ...f, restaurant_id: restaurantId }));
      }
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useTables(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return MOCK_TABLES;
      if (restaurantId === 'guest-restaurant-id') {
        const local = await db.restaurantTables.toArray();
        if (isEmpty(local)) {
          const prepop = MOCK_TABLES;
          await db.restaurantTables.bulkAdd(prepop);
          return prepop;
        }
        return local;
      }
      const { data: floors } = await supabase
        .from('floors')
        .select('id')
        .eq('restaurant_id', restaurantId);

      const floorIds = (floors || []).map(f => f.id);
      if (floorIds.length === 0) return MOCK_TABLES;

      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .in('floor_id', floorIds);

      if (error) throw error;
      if (isEmpty(data)) {
        return MOCK_TABLES;
      }
      return data.map((t: any) => ({
        id: t.id,
        floor_id: t.floor_id,
        number: t.number.startsWith('T') ? t.number : `T${t.number}`,
        capacity: t.capacity ?? 4,
        shape: t.shape || 'square',
        status: t.status || 'available',
        current_order_id: t.current_order_id,
      }));
    },
    enabled: !!restaurantId,
  });
}

export function useMenuCategories(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['menu_categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return MOCK_CATEGORIES;
      if (restaurantId === 'guest-restaurant-id') {
        const local = await db.menuCategories.toArray();
        if (isEmpty(local)) {
          const prepop = MOCK_CATEGORIES.map(c => ({ ...c, restaurant_id: restaurantId }));
          await db.menuCategories.bulkAdd(prepop);
          return prepop;
        }
        return local;
      }
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (isEmpty(data)) {
        return MOCK_CATEGORIES.map(c => ({ ...c, restaurant_id: restaurantId }));
      }
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useMenuItems(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['menu_items', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return MOCK_MENU_ITEMS;
      if (restaurantId === 'guest-restaurant-id') {
        const local = await db.menuItems.toArray();
        if (isEmpty(local)) {
          const prepop = MOCK_MENU_ITEMS;
          await db.menuItems.bulkAdd(prepop);
          return prepop;
        }
        return local.map((item: any) => ({
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          price: Number(item.price),
          item_type: (item.item_type || 'veg').toLowerCase() as any,
          is_available: item.is_available ?? true,
          tax_rate: Number(item.tax_rate || 5),
          description: item.description || '',
        }));
      }
      const { data: cats } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('restaurant_id', restaurantId);

      const catIds = (cats || []).map(c => c.id);
      if (catIds.length === 0) return MOCK_MENU_ITEMS;

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', catIds)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (isEmpty(data)) {
        return MOCK_MENU_ITEMS;
      }
      return data.map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        price: Number(item.price),
        item_type: (item.item_type || 'veg').toLowerCase() as any,
        is_available: item.is_available ?? true,
        tax_rate: Number(item.tax_rate || 5),
        description: item.description || '',
      }));
    },
    enabled: !!restaurantId,
  });
}

export function useTaxConfig(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['tax_config', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { service_charge_enabled: false, service_charge_pct: 0, packaging_charge: 0, round_off: 'nearest' };
      if (restaurantId === 'guest-restaurant-id') {
        const local = localStorage.getItem('guest_tax_config');
        if (!local) {
          const initial = { service_charge_enabled: false, service_charge_pct: 0, packaging_charge: 0, round_off: 'nearest' };
          localStorage.setItem('guest_tax_config', JSON.stringify(initial));
          return initial;
        }
        return JSON.parse(local);
      }
      const { data, error } = await supabase
        .from('tax_config')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return { service_charge_enabled: false, service_charge_pct: 0, packaging_charge: 0, round_off: 'nearest' };
      }
      return {
        service_charge_enabled: data.service_charge_enabled ?? false,
        service_charge_pct: Number(data.service_charge_pct || 0),
        packaging_charge: Number(data.packaging_charge || 0),
        round_off: data.round_off || 'nearest',
      };
    },
    enabled: !!restaurantId,
  });
}

export function usePrinters(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['printers', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      if (restaurantId === 'guest-restaurant-id') {
        const local = localStorage.getItem('guest_printers');
        if (!local) {
          const initial = [
            {
              id: 'printer-1',
              name: 'Main Thermal Billing Printer',
              type: 'Bill',
              connection: 'USB',
              ipAddress: '',
              paperWidth: '80mm',
              isDefault: true,
              hasCashDrawer: true,
            }
          ];
          localStorage.setItem('guest_printers', JSON.stringify(initial));
          return initial;
        }
        return JSON.parse(local);
      }
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type === 'kot' ? 'KOT' : p.type === 'bill' ? 'Bill' : p.type === 'bar' ? 'Bar' : 'Label',
        connection: p.connection,
        ipAddress: p.ip_address || '',
        paperWidth: p.paper_width || '80mm',
        isDefault: p.is_default ?? false,
        hasCashDrawer: p.has_cash_drawer ?? false,
      }));
    },
    enabled: !!restaurantId,
  });
}

// ════════════ MUTATIONS ════════════

export function useUpdateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      if (id === 'guest-restaurant-id') {
        localStorage.setItem('guest_restaurant_profile', JSON.stringify(payload));
        return;
      }
      const { error } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['restaurant', id] });
      toast.success('Restaurant profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update restaurant profile');
    },
  });
}

export function useUpsertTaxConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, payload }: { restaurantId: string; payload: Record<string, any> }) => {
      if (restaurantId === 'guest-restaurant-id') {
        localStorage.setItem('guest_tax_config', JSON.stringify(payload));
        return;
      }
      const { error } = await supabase
        .from('tax_config')
        .upsert({
          restaurant_id: restaurantId,
          service_charge_enabled: payload.service_charge_enabled,
          service_charge_pct: Number(payload.service_charge_pct),
          packaging_charge: Number(payload.packaging_charge),
          round_off: payload.round_off,
        });
      if (error) throw error;
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['tax_config', restaurantId] });
      toast.success('Tax config updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update tax configuration');
    },
  });
}

export function useSavePrinter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId, payload }: { id?: string; restaurantId: string; payload: Record<string, any> }) => {
      if (restaurantId === 'guest-restaurant-id') {
        const local = localStorage.getItem('guest_printers');
        const printers = local ? JSON.parse(local) : [];
        const newPrinter = { ...payload, id: id || crypto.randomUUID() };
        let updated;
        if (id) {
          updated = printers.map((p: any) => p.id === id ? newPrinter : p);
        } else {
          updated = [...printers, newPrinter];
        }
        localStorage.setItem('guest_printers', JSON.stringify(updated));
        return;
      }
      const printerRow = {
        restaurant_id: restaurantId,
        name: payload.name,
        type: payload.type.toLowerCase(),
        connection: payload.connection,
        ip_address: payload.ipAddress || null,
        paper_width: payload.paperWidth,
        is_default: !!payload.isDefault,
        has_cash_drawer: !!payload.hasCashDrawer,
      };

      if (id) {
        const { error } = await supabase
          .from('printers')
          .update(printerRow)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('printers')
          .insert(printerRow);
        if (error) throw error;
      }
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['printers', restaurantId] });
      toast.success('Printer configuration saved');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save printer');
    },
  });
}

export function useDeletePrinter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      if (restaurantId === 'guest-restaurant-id') {
        const local = localStorage.getItem('guest_printers');
        const printers = local ? JSON.parse(local) : [];
        const updated = printers.filter((p: any) => p.id !== id);
        localStorage.setItem('guest_printers', JSON.stringify(updated));
        return;
      }
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['printers', restaurantId] });
      toast.success('Printer configuration deleted');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete printer');
    },
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId, payload }: { id?: string; restaurantId: string; payload: Record<string, any> }) => {
      if (restaurantId === 'guest-restaurant-id') {
        const catRow = {
          id: id || crypto.randomUUID(),
          restaurant_id: restaurantId,
          name: payload.name,
          type: payload.type || 'both',
          is_active: payload.is_active ?? true,
        };
        await db.menuCategories.put(catRow);
        return;
      }
      const catRow = {
        restaurant_id: restaurantId,
        name: payload.name,
        type: payload.type || 'both',
        is_active: payload.is_active ?? true,
      };

      if (id) {
        const { error } = await supabase
          .from('menu_categories')
          .update(catRow)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_categories')
          .insert(catRow);
        if (error) throw error;
      }
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['menu_categories', restaurantId] });
      toast.success('Category saved');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save category');
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      if (restaurantId === 'guest-restaurant-id') {
        await db.menuCategories.delete(id);
        // Also delete items in this category
        const items = await db.menuItems.where('category_id').equals(id).toArray();
        for (const item of items) {
          await db.menuItems.delete(item.id);
        }
        return;
      }
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['menu_categories', restaurantId] });
      qc.invalidateQueries({ queryKey: ['menu_items', restaurantId] });
      toast.success('Category deleted');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete category');
    },
  });
}

export function useSaveMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId, payload }: { id?: string; restaurantId: string; payload: Record<string, any> }) => {
      if (restaurantId === 'guest-restaurant-id') {
        const itemRow = {
          id: id || crypto.randomUUID(),
          category_id: payload.category_id,
          restaurant_id: restaurantId,
          name: payload.name,
          price: Number(payload.price),
          item_type: payload.item_type || 'Veg',
          is_available: payload.is_available ?? true,
          description: payload.description || '',
        };
        await db.menuItems.put(itemRow);
        return;
      }
      const itemRow = {
        category_id: payload.category_id,
        restaurant_id: restaurantId,
        name: payload.name,
        price: Number(payload.price),
        base_price: Number(payload.price),
        item_type: payload.item_type || 'Veg',
        is_available: payload.is_available ?? true,
        description: payload.description || '',
      };

      if (id) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemRow)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(itemRow);
        if (error) throw error;
      }
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['menu_items', restaurantId] });
      toast.success('Menu item saved');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save menu item');
    },
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      if (restaurantId === 'guest-restaurant-id') {
        await db.menuItems.delete(id);
        return;
      }
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { restaurantId }) => {
      qc.invalidateQueries({ queryKey: ['menu_items', restaurantId] });
      toast.success('Menu item deleted');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete menu item');
    },
  });
}
