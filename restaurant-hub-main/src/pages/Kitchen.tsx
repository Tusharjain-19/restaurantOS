import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Filter, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MOCK_KITCHEN_ORDERS, type KitchenOrder } from '@/lib/mock-data';

export default function Kitchen() {
  const [orders, setOrders] = useState<KitchenOrder[]>(MOCK_KITCHEN_ORDERS);
  const [filter, setFilter] = useState('all');
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter === 'food') return o.items.some(i => i.item_type === 'veg' || i.item_type === 'non-veg');
    if (filter === 'beverages') return false; // simplified
    if (filter === 'priority') return o.is_priority;
    return true;
  }).sort((a, b) => {
    if (a.status === 'ready' && b.status !== 'ready') return 1;
    if (b.status === 'ready' && a.status !== 'ready') return -1;
    return b.elapsed_minutes - a.elapsed_minutes;
  });

  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (o.status === 'new') return { ...o, status: 'in_prep' as const };
      if (o.status === 'in_prep') return { ...o, status: 'ready' as const };
      return o;
    }));
  };

  const pendingCount = orders.filter(o => o.status !== 'ready').length;
  const avgPrepTime = Math.round(orders.reduce((s, o) => s + o.elapsed_minutes, 0) / orders.length);
  const longestWait = Math.max(...orders.map(o => o.elapsed_minutes));

  return (
    <div className="fixed inset-0 bg-[#1A1A2E] text-white flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold font-mono">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <span className="text-sm text-white/50">RestaurantOS Kitchen</span>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-white/10 h-8">
              <TabsTrigger value="all" className="text-xs text-white data-[state=active]:bg-white/20">All</TabsTrigger>
              <TabsTrigger value="food" className="text-xs text-white data-[state=active]:bg-white/20">Food</TabsTrigger>
              <TabsTrigger value="priority" className="text-xs text-white data-[state=active]:bg-white/20">Priority</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <a href="/dashboard" className="text-xs text-white/40 hover:text-white">✕ Exit</a>
        </div>
      </div>

      {/* Order Cards Grid */}
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex gap-3 h-full">
          {filteredOrders.map(order => (
            <KitchenCard key={order.id} order={order} onAdvance={() => advanceStatus(order.id)} />
          ))}
          {filteredOrders.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-white/30 text-lg">
              No orders — Kitchen is clear! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-white/5 text-xs">
        <div className="flex items-center gap-6">
          <span><span className="text-white/50">Pending:</span> <span className="font-bold text-accent">{pendingCount}</span></span>
          <span><span className="text-white/50">Avg Prep:</span> <span className="font-bold">{avgPrepTime}m</span></span>
          <span><span className="text-white/50">Longest Wait:</span> <span className="font-bold text-red-400">{longestWait}m</span></span>
        </div>
        <span className="text-white/30">Auto-refreshes via realtime</span>
      </div>
    </div>
  );
}

function KitchenCard({ order, onAdvance }: { order: KitchenOrder; onAdvance: () => void }) {
  const borderColor = order.elapsed_minutes >= 10
    ? 'border-red-500 shadow-red-500/20 shadow-lg'
    : order.elapsed_minutes >= 5
      ? 'border-yellow-500'
      : 'border-white/20';

  const headerColor = order.status === 'new'
    ? 'bg-blue-600'
    : order.status === 'in_prep'
      ? 'bg-orange-500'
      : 'bg-green-600';

  const actionLabel = order.status === 'new' ? 'Start Prep' : order.status === 'in_prep' ? 'Mark Ready' : null;

  return (
    <div className={cn(
      "w-[260px] min-w-[260px] rounded-xl border-2 bg-white/5 flex flex-col overflow-hidden",
      borderColor,
      order.elapsed_minutes >= 10 && "animate-pulse",
    )}>
      {/* Header */}
      <div className={cn("px-3 py-2 flex items-center justify-between text-white text-xs", headerColor)}>
        <div className="flex items-center gap-2">
          <span className="font-bold">{order.table_number}</span>
          <span className="opacity-70">• {order.order_type}</span>
        </div>
        <span>{order.created_at}</span>
      </div>

      {order.is_priority && (
        <div className="bg-red-600 text-white text-[10px] font-bold text-center py-0.5 flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3" /> PRIORITY
        </div>
      )}

      {order.is_addon && (
        <div className="bg-accent text-white text-[10px] font-bold text-center py-0.5">
          ADD-ON to {order.table_number}
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1 text-[10px] text-white/50 border-b border-white/10">
        <span>KOT #{order.kot_number.toString().padStart(3, '0')}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={cn(
            "font-bold",
            order.elapsed_minutes >= 10 ? "text-red-400" : order.elapsed_minutes >= 5 ? "text-yellow-400" : "text-white/70"
          )}>{order.elapsed_minutes}m</span>
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 px-3 py-2 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i}>
            <div className="flex items-start gap-2 text-xs">
              <span className={cn("mt-0.5", item.item_type === 'veg' ? "text-green-400" : "text-red-400")}>
                {item.item_type === 'veg' ? '●' : '◉'}
              </span>
              <span className="text-white/90">
                {item.qty}x {item.name}
                {item.variant && <span className="text-white/50"> [{item.variant}]</span>}
              </span>
            </div>
            {item.special_instructions && (
              <div className="ml-5 text-[10px] text-yellow-400 flex items-center gap-1">
                ⚠ {item.special_instructions}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      {actionLabel && (
        <div className="px-3 pb-3">
          <Button onClick={onAdvance} size="sm"
            className={cn("w-full h-9 text-xs font-bold",
              order.status === 'new' ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"
            )}>
            {actionLabel}
          </Button>
        </div>
      )}
      {order.status === 'ready' && (
        <div className="px-3 pb-3 text-center text-xs text-green-400 font-bold">✓ READY FOR PICKUP</div>
      )}
    </div>
  );
}
