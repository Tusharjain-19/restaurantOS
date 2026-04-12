import { useState } from 'react';
import { ChefHat, Clock, AlertCircle, CheckCircle2, Flame, Timer, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { db, type KOT } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  received: { label: 'NEW', bg: 'bg-destructive/10 border-destructive/30', text: 'text-destructive' },
  in_preparation: { label: 'COOKING', bg: 'bg-warning/10 border-warning/30', text: 'text-warning' },
  ready: { label: 'READY', bg: 'bg-success/10 border-success/30', text: 'text-success' },
  served: { label: 'SERVED', bg: 'bg-muted border-muted', text: 'text-muted-foreground' },
  cancelled: { label: 'VOID', bg: 'bg-muted border-muted', text: 'text-muted-foreground line-through' },
};

export default function Kitchen() {
  const kots = useLiveQuery(() => db.kots.orderBy('created_at').reverse().toArray()) || [];
  const [filter, setFilter] = useState('active');

  const activeKots = kots.filter(k => k.status === 'received' || k.status === 'in_preparation');
  const readyKots = kots.filter(k => k.status === 'ready');
  const filtered = filter === 'active'
    ? kots.filter(k => k.status !== 'served' && k.status !== 'cancelled')
    : filter === 'ready' ? readyKots
    : kots;

  const updateStatus = async (kot: KOT, status: KOT['status']) => {
    await db.kots.update(kot.id!, { status, updated_at: new Date() });
    toast.success(`KOT #${kot.kot_number} → ${STATUS_CONFIG[status]?.label}`);
  };

  const nextStatus = (current: string): KOT['status'] | null => {
    switch (current) {
      case 'received': return 'in_preparation';
      case 'in_preparation': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-7 w-7" /> Kitchen Display
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeKots.length} active orders • {readyKots.length} ready for pickup
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="all">All KOTs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2">
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1" variant="outline">
          <Flame className="h-3.5 w-3.5 mr-1" /> New: {kots.filter(k => k.status === 'received').length}
        </Badge>
        <Badge className="bg-warning/10 text-warning border-warning/20 px-3 py-1" variant="outline">
          <Timer className="h-3.5 w-3.5 mr-1" /> Cooking: {kots.filter(k => k.status === 'in_preparation').length}
        </Badge>
        <Badge className="bg-success/10 text-success border-success/20 px-3 py-1" variant="outline">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Ready: {readyKots.length}
        </Badge>
      </div>

      {/* KOT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(kot => {
          const sc = STATUS_CONFIG[kot.status] || STATUS_CONFIG.received;
          const elapsed = Math.floor((Date.now() - new Date(kot.created_at).getTime()) / 60000);
          const isUrgent = elapsed > 15 && (kot.status === 'received' || kot.status === 'in_preparation');
          const next = nextStatus(kot.status);

          return (
            <Card key={kot.id} className={cn(
              "border-2 transition-all hover:shadow-lg",
              sc.bg,
              isUrgent && "animate-pulse border-destructive"
            )}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs font-bold", sc.text, sc.bg)}>
                    KOT #{kot.kot_number}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{sc.label}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {isUrgent && <AlertCircle className="h-4 w-4 text-destructive animate-bounce" />}
                  <span className={cn("text-xs font-medium", isUrgent ? "text-destructive" : "text-muted-foreground")}>
                    <Clock className="h-3 w-3 inline mr-0.5" />{elapsed}m
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{kot.table_number} • {kot.order_type}</span>
                  {kot.staff_name && <span className="text-muted-foreground">{kot.staff_name}</span>}
                </div>

                <div className="space-y-1">
                  {kot.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className={cn("h-3 w-3 rounded-sm border-2 mt-0.5 shrink-0",
                        item.item_type === 'veg' ? "border-green-600 bg-green-600" : "border-red-600 bg-red-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">
                          {item.quantity}× {item.name}
                        </span>
                        {item.variant && <span className="text-xs text-muted-foreground ml-1">[{item.variant}]</span>}
                        {item.special_instructions && (
                          <div className="text-[11px] text-accent font-medium mt-0.5">⚠ {item.special_instructions}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {next && (
                  <Button size="sm" className={cn("w-full h-9 text-xs font-semibold",
                    next === 'in_preparation' && "bg-warning text-warning-foreground hover:bg-warning/90",
                    next === 'ready' && "bg-success text-success-foreground hover:bg-success/90",
                    next === 'served' && "bg-primary text-primary-foreground",
                  )} onClick={() => updateStatus(kot, next)}>
                    {next === 'in_preparation' && '🍳 Start Cooking'}
                    {next === 'ready' && '✅ Mark Ready'}
                    {next === 'served' && '🍽️ Mark Served'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ChefHat className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">No kitchen orders</p>
          <p className="text-sm">Orders sent from POS will appear here as KOTs</p>
        </div>
      )}
    </div>
  );
}
