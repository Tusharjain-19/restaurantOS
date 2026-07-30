import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const EVENT_ICONS: Record<string, string> = {
  kot_sent: '🔵',
  bill_requested: '💰',
  order_created: '🆕',
  table_freed: '🟢',
  order_cancelled: '🚫',
};

const EVENT_TITLES: Record<string, string> = {
  kot_sent: 'KOT sent to kitchen',
  bill_requested: 'Bill requested',
  order_created: 'New order',
  table_freed: 'Table freed',
  order_cancelled: 'Order cancelled',
};

export default function WaiterAlerts() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;

  const { data: events = [] } = useQuery({
    queryKey: ['alerts', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('realtime_events')
        .select('id, event_type, payload, created_at')
        .eq('restaurant_id', restaurantId!)
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  return (
    <div>
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center">
        <h1 className="text-base font-bold">Alerts</h1>
      </header>
      <div className="p-3 space-y-2">
        {events.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No alerts yet.</p>
        )}
        {events.map((e: any) => {
          const p = e.payload ?? {};
          return (
            <div key={e.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span>{EVENT_ICONS[e.event_type] ?? '🔔'}</span>
                  {EVENT_TITLES[e.event_type] ?? e.event_type}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground mt-1">
                {p.table_number ? `Table ${p.table_number}` : null}
                {p.kot_number ? ` · ${p.kot_number}` : null}
                {p.item_count ? ` · ${p.item_count} items` : null}
                {p.waiter_name ? ` · by ${p.waiter_name}` : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
