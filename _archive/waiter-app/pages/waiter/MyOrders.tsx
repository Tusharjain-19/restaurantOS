import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function WaiterMyOrders() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const restaurantId = profile?.restaurant_id;

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', restaurantId, profile?.id],
    enabled: !!restaurantId && !!profile?.id,
    queryFn: async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('orders')
        .select('id, status, created_at, guest_count, table_id, customer_name, order_type')
        .eq('restaurant_id', restaurantId!)
        .eq('waiter_id', profile!.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables-min', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase.from('tables').select('id, number').eq('restaurant_id', restaurantId!);
      return data ?? [];
    },
  });
  const tableMap = new Map(tables.map((t) => [t.id, t.number]));

  return (
    <div>
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center">
        <h1 className="text-base font-bold">My orders today</h1>
      </header>
      <div className="p-3 space-y-2">
        {orders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No orders yet today.</p>
        )}
        {orders.map((o: any) => {
          const meta = statusMeta(o.status);
          return (
            <button
              key={o.id}
              onClick={() => navigate(`/waiter/order/${o.id}`)}
              className={cn(
                'w-full text-left rounded-2xl border-2 p-3 bg-card transition-colors',
                meta.cls,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {o.order_type === 'takeaway' ? '🥡 Takeaway' : tableMap.get(o.table_id) ?? 'Table —'}
                </div>
                <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}{o.guest_count ?? 1} covers
                {o.customer_name ? ` · ${o.customer_name}` : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function statusMeta(s: string) {
  switch (s) {
    case 'pending': return { label: 'Active', cls: 'border-warning/40 bg-warning/5' };
    case 'active': return { label: 'Active', cls: 'border-warning/40 bg-warning/5' };
    case 'kot_sent': return { label: 'KOT sent', cls: 'border-info/40 bg-info/5' };
    case 'billed': return { label: 'Bill requested', cls: 'border-destructive/40 bg-destructive/5' };
    case 'paid': return { label: 'Done', cls: 'border-success/40 bg-success/5' };
    case 'cancelled': return { label: 'Cancelled', cls: 'border-border' };
    default: return { label: s, cls: 'border-border' };
  }
}
