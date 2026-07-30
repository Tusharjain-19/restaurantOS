import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SendKotArgs {
  orderId: string;
  waiterId: string;
  restaurantId: string;
}

interface SendKotResult {
  success: boolean;
  error?: string;
  kot_number?: string;
  batch_number?: number;
  is_addon?: boolean;
  item_count?: number;
  kot_batch_id?: string;
}

export function useSendKOT() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, waiterId, restaurantId }: SendKotArgs) => {
      const { data, error } = await supabase.rpc('send_kot' as any, {
        p_order_id: orderId,
        p_waiter_id: waiterId,
        p_restaurant_id: restaurantId,
      });
      if (error) throw new Error(error.message);
      const result = data as unknown as SendKotResult;
      if (!result?.success) throw new Error(result?.error ?? 'KOT failed');
      return result;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['order', vars.orderId] });
      qc.invalidateQueries({ queryKey: ['kot_batches', vars.restaurantId] });
      const msg = data.is_addon
        ? `🍳 Add-On KOT sent! ${data.item_count} item${data.item_count !== 1 ? 's' : ''}`
        : `🍳 KOT #${data.batch_number} sent! ${data.item_count} items to kitchen`;
      toast.success(msg);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to send KOT.');
    },
  });
}
