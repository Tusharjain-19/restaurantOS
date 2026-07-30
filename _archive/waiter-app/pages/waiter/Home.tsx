import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, IndianRupee } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Floor { id: string; name: string }
interface Table {
  id: string; number: string; capacity: number; shape: string;
  status: string; current_order_id: string | null; floor_id: string;
}
interface OrderLite {
  id: string; table_id: string | null; status: string; created_at: string;
}

export default function WaiterHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const restaurantId = profile?.restaurant_id;
  const [activeFloor, setActiveFloor] = useState<string>('all');
  const [pickedTable, setPickedTable] = useState<Table | null>(null);
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');

  const { data: floors = [] } = useQuery({
    queryKey: ['floors', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('floors').select('id, name')
        .eq('restaurant_id', restaurantId!).order('display_order');
      return (data ?? []) as Floor[];
    },
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('tables').select('id, number, capacity, shape, status, current_order_id, floor_id')
        .eq('restaurant_id', restaurantId!).order('number');
      return (data ?? []) as Table[];
    },
  });

  const { data: openOrders = [] } = useQuery({
    queryKey: ['orders', restaurantId, 'open'],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('orders').select('id, table_id, status, created_at')
        .eq('restaurant_id', restaurantId!)
        .in('status', ['pending', 'active', 'kot_sent', 'billed']);
      return (data ?? []) as OrderLite[];
    },
  });

  const orderByTable = new Map(openOrders.map((o) => [o.table_id, o]));

  const createOrder = useMutation({
    mutationFn: async ({ table, guestCount, note }: { table: Table; guestCount: number; note: string }) => {
      const { data: order, error } = await supabase
        .from('orders').insert({
          restaurant_id: restaurantId!,
          table_id: table.id,
          floor_id: table.floor_id,
          order_type: 'dine_in',
          status: 'pending',
          waiter_id: profile?.id ?? null,
          guest_count: guestCount,
          notes: note || null,
        }).select('id').single();
      if (error) throw error;
      await supabase.from('tables').update({ status: 'occupied', current_order_id: order.id }).eq('id', table.id);
      return order.id as string;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['tables', restaurantId] });
      qc.invalidateQueries({ queryKey: ['orders', restaurantId, 'open'] });
      setPickedTable(null);
      setGuests(2); setNotes('');
      navigate(`/waiter/order/${id}`);
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to start order'),
  });

  const filtered = tables.filter((t) => activeFloor === 'all' || t.floor_id === activeFloor);
  const stats = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <div>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold leading-none">Tables</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{profile?.name ?? 'Waiter'}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />{stats.available}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />{stats.occupied}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />{stats.reserved}</span>
        </div>
      </header>

      {/* Floor tabs */}
      <div className="sticky top-14 z-10 bg-card/95 backdrop-blur border-b border-border overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          <FloorPill label={`All ${tables.length}`} active={activeFloor === 'all'} onClick={() => setActiveFloor('all')} />
          {floors.map((f) => {
            const count = tables.filter((t) => t.floor_id === f.id).length;
            return (
              <FloorPill key={f.id} label={`${f.name} ${count}`} active={activeFloor === f.id} onClick={() => setActiveFloor(f.id)} />
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No tables set up yet.
          </div>
        )}
        {filtered.map((t) => {
          const order = orderByTable.get(t.id);
          const isOccupied = t.status === 'occupied' || !!order;
          const goExisting = () => order && navigate(`/waiter/order/${order.id}`);
          return (
            <button
              key={t.id}
              onClick={() => (isOccupied ? goExisting() : setPickedTable(t))}
              className={cn(
                'rounded-2xl border-2 p-3 text-left bg-card transition-all active:scale-[0.98]',
                t.status === 'available' && 'border-success/50',
                isOccupied && 'border-destructive/60 bg-destructive/5',
                t.status === 'reserved' && 'border-warning/60 bg-warning/5 border-dashed',
                t.status === 'dirty' && 'border-muted-foreground/30 bg-muted',
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn(
                  'text-2xl font-bold leading-none',
                  isOccupied ? 'text-destructive' : t.status === 'reserved' ? 'text-warning' : 'text-success',
                )}>{t.number}</span>
                {isOccupied && order && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />{minsAgo(order.created_at)}m
                  </span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> {t.capacity} seats
              </div>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide">
                {isOccupied ? 'View order' : t.status === 'reserved' ? 'Reserved' : t.status === 'dirty' ? 'Cleaning' : '+ New order'}
              </div>
            </button>
          );
        })}
      </div>

      {/* New order sheet */}
      <Sheet open={!!pickedTable} onOpenChange={(o) => !o && setPickedTable(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Start order at {pickedTable?.number}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Guests</label>
              <div className="flex items-center gap-3 mt-1">
                <Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}>−</Button>
                <span className="text-2xl font-bold w-10 text-center">{guests}</span>
                <Button variant="outline" size="icon" onClick={() => setGuests(guests + 1)}>+</Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Birthday table, high chair"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full h-12 text-base"
              disabled={createOrder.isPending}
              onClick={() => pickedTable && createOrder.mutate({ table: pickedTable, guestCount: guests, note: notes })}
            >
              {createOrder.isPending ? 'Starting…' : 'Start order →'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FloorPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >{label}</button>
  );
}

function minsAgo(ts: string) {
  return Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
}
