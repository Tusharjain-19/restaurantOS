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

// Helper to check if a database table returns no data
const isEmpty = (arr: any) => !arr || arr.length === 0;

export function useRestaurant(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
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
    mutationFn: async ({ id }: { id: string; restaurantId: string }) => {
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
    mutationFn: async ({ id }: { id: string; restaurantId: string }) => {
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
    mutationFn: async ({ id }: { id: string; restaurantId: string }) => {
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
