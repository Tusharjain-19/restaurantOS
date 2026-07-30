import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Subscribes to all per-restaurant realtime channels needed by the waiter app
 * and invalidates the relevant React Query caches when changes arrive.
 */
export function useRestaurantRealtime(restaurantId: string | null | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`restaurant_${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['orders', restaurantId] });
          qc.invalidateQueries({ queryKey: ['tables', restaurantId] });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items', filter: `restaurant_id=eq.${restaurantId}` },
        (payload: any) => {
          const orderId = payload?.new?.order_id ?? payload?.old?.order_id;
          if (orderId) qc.invalidateQueries({ queryKey: ['order', orderId] });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => qc.invalidateQueries({ queryKey: ['tables', restaurantId] }),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kot_batches', filter: `restaurant_id=eq.${restaurantId}` },
        () => qc.invalidateQueries({ queryKey: ['kot_batches', restaurantId] }),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'realtime_events', filter: `restaurant_id=eq.${restaurantId}` },
        () => qc.invalidateQueries({ queryKey: ['alerts', restaurantId] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, qc]);
}
