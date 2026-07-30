import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, Search, Send, Receipt, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useSendKOT } from '@/hooks/useSendKOT';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderRow {
  id: string; restaurant_id: string | null; table_id: string | null; status: string;
  guest_count: number | null; notes: string | null; order_type: string | null;
}
interface ItemRow {
  id: string; item_id: string; variant_id: string | null;
  item_name: string; variant_name: string | null;
  unit_price: number; qty: number; special_instructions: string | null;
  kot_status: string; kot_batch: number | null; kot_sent_at: string | null;
}
interface Category { id: string; name: string; emoji: string | null }
interface MenuItem {
  id: string; name: string; description: string | null;
  price: number; base_price: number | null; category_id: string;
  item_type: string; is_available: boolean | null; image_url: string | null;
}
interface Variant { id: string; item_id: string; name: string; price: number | null; is_default: boolean | null }

export default function WaiterOrder() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id ?? '';

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | 'all'>('all');
  const [variantPick, setVariantPick] = useState<MenuItem | null>(null);
  const [variantSel, setVariantSel] = useState<string | null>(null);
  const [variantQty, setVariantQty] = useState(1);
  const [variantNote, setVariantNote] = useState('');
  const [confirmKOT, setConfirmKOT] = useState(false);
  const [confirmBill, setConfirmBill] = useState(false);

  const sendKot = useSendKOT();

  // Order
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders').select('id, restaurant_id, table_id, status, guest_count, notes, order_type')
        .eq('id', orderId).single();
      if (error) throw error;
      return data as OrderRow;
    },
  });

  // Table number
  const { data: tableNumber } = useQuery({
    queryKey: ['table-num', order?.table_id],
    enabled: !!order?.table_id,
    queryFn: async () => {
      const { data } = await supabase.from('tables').select('number').eq('id', order!.table_id!).single();
      return data?.number ?? '';
    },
  });

  // Items
  const { data: items = [] } = useQuery({
    queryKey: ['order', orderId, 'items'],
    enabled: !!orderId,
    queryFn: async () => {
      const { data } = await supabase
        .from('order_items')
        .select('id, item_id, variant_id, item_name, variant_name, unit_price, qty, special_instructions, kot_status, kot_batch, kot_sent_at')
        .eq('order_id', orderId).order('created_at');
      return (data ?? []) as ItemRow[];
    },
  });

  // Menu
  const { data: categories = [] } = useQuery({
    queryKey: ['cats', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_categories').select('id, name, emoji')
        .eq('restaurant_id', restaurantId).eq('is_active', true).order('display_order');
      return (data ?? []) as Category[];
    },
  });

  const { data: menu = [] } = useQuery({
    queryKey: ['menu', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('id, name, description, price, base_price, category_id, item_type, is_available, image_url')
        .eq('restaurant_id', restaurantId).eq('is_available', true).order('display_order');
      return (data ?? []) as MenuItem[];
    },
  });

  const { data: variants = [] } = useQuery({
    queryKey: ['variants', restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data } = await supabase.from('menu_variants').select('id, item_id, name, price, is_default');
      return (data ?? []) as Variant[];
    },
  });

  const variantsByItem = useMemo(() => {
    const m = new Map<string, Variant[]>();
    for (const v of variants) {
      const arr = m.get(v.item_id) ?? [];
      arr.push(v); m.set(v.item_id, arr);
    }
    return m;
  }, [variants]);

  // === Mutations ===
  const addItem = useMutation({
    mutationFn: async (p: { item: MenuItem; variant?: Variant; qty: number; note?: string }) => {
      const price = p.variant?.price ?? p.item.base_price ?? p.item.price;
      const variantId = p.variant?.id ?? null;
      const note = p.note ?? null;

      // KOT-safe merge: only merge into an existing PENDING row with same item+variant+note.
      // Sent rows are immutable (a kitchen instruction has already been issued).
      const existingPending = items.find(
        (r) =>
          r.kot_status === 'pending' &&
          r.item_id === p.item.id &&
          (r.variant_id ?? null) === variantId &&
          (r.special_instructions ?? null) === note,
      );

      if (existingPending) {
        const { error } = await supabase
          .from('order_items')
          .update({ qty: existingPending.qty + p.qty })
          .eq('id', existingPending.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from('order_items').insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        item_id: p.item.id,
        variant_id: variantId,
        item_name: p.item.name,
        variant_name: p.variant?.name ?? null,
        unit_price: price,
        qty: p.qty,
        special_instructions: note,
        kot_status: 'pending',
        kot_batch: 0,
        added_by: profile?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId, 'items'] }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to add item'),
  });

  const updateQty = useMutation({
    mutationFn: async ({ row, delta }: { row: ItemRow; delta: number }) => {
      // Sent rows are locked (kitchen has been told). Guarded by DB trigger too.
      if (row.kot_status === 'sent') {
        throw new Error('Item already sent to kitchen. Add a new line instead.');
      }
      const newQty = row.qty + delta;
      if (newQty < 1) {
        const { error } = await supabase.from('order_items').delete().eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('order_items').update({ qty: newQty }).eq('id', row.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId, 'items'] }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to update'),
  });

  const requestBill = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('orders').update({ status: 'billed' }).eq('id', orderId);
      if (error) throw error;
      await supabase.from('realtime_events').insert({
        restaurant_id: restaurantId,
        event_type: 'bill_requested',
        payload: { order_id: orderId, table_number: tableNumber },
        triggered_by: profile?.id ?? null,
      });
    },
    onSuccess: () => {
      toast.success(`Bill requested for ${tableNumber ?? 'table'} ✓`);
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      setConfirmBill(false);
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to request bill'),
  });

  // === Derived ===
  const filteredMenu = menu.filter((m) => {
    if (activeCat !== 'all' && m.category_id !== activeCat) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const batches = new Map<number, ItemRow[]>();
    const pending: ItemRow[] = [];
    for (const it of items) {
      if (it.kot_status === 'pending') pending.push(it);
      else {
        const b = it.kot_batch ?? 0;
        const arr = batches.get(b) ?? [];
        arr.push(it); batches.set(b, arr);
      }
    }
    return {
      sent: Array.from(batches.entries()).sort((a, b) => a[0] - b[0]),
      pending,
    };
  }, [items]);

  const total = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const pendingCount = grouped.pending.length;
  const hasSent = grouped.sent.length > 0;
  const billRequested = order?.status === 'billed' || order?.status === 'paid';

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-3 h-14 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/waiter/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{tableNumber ?? '…'}</span>
            <Badge variant="secondary" className="text-[10px]">{order?.order_type ?? 'dine_in'}</Badge>
            {billRequested && <Badge className="text-[10px] bg-warning text-warning-foreground">BILL</Badge>}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {order?.guest_count ?? 0} guests · {items.length} items
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold">₹{total.toFixed(0)}</div>
        </div>
      </header>

      {/* Cart */}
      <section className="bg-card border-b border-border">
        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Order · {items.length} items
        </div>
        <ScrollArea className="max-h-[40vh]">
          <div className="px-3 pb-2">
            {items.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No items yet. Add from menu below.</p>
            )}
            {grouped.sent.map(([batch, rows]) => (
              <div key={batch} className="mb-2">
                <div className="text-[10px] uppercase tracking-wider text-info font-semibold py-1 px-1">
                  KOT #{batch}{batch > 1 ? ' (Add-On)' : ''} · {rows[0].kot_sent_at ? new Date(rows[0].kot_sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
                {rows.map((r) => <ItemRowView key={r.id} row={r} onQty={(d) => updateQty.mutate({ row: r, delta: d })} disabled />)}
              </div>
            ))}
            {grouped.pending.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-warning font-semibold py-1 px-1">
                  Pending · Not sent yet
                </div>
                {grouped.pending.map((r) => <ItemRowView key={r.id} row={r} onQty={(d) => updateQty.mutate({ row: r, delta: d })} />)}
              </div>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* Search & cats */}
      <div className="bg-card border-b border-border px-3 py-2 space-y-2">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="pl-9 h-10"
            disabled={billRequested}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
          <FloorPill label="All" active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
          {categories.map((c) => (
            <FloorPill key={c.id} label={`${c.emoji ?? ''} ${c.name}`.trim()} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <ScrollArea className="flex-1">
        <div className="p-3 grid grid-cols-2 gap-3 pb-24">
          {filteredMenu.map((m) => {
            const vs = variantsByItem.get(m.id);
            const hasVariants = vs && vs.length > 0;
            const minPrice = hasVariants
              ? Math.min(...vs!.map((v) => v.price ?? 0).filter((x) => x > 0))
              : (m.base_price ?? m.price);
            return (
              <div key={m.id} className="rounded-2xl bg-card border border-border p-3 flex flex-col">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'inline-block h-2.5 w-2.5 rounded-full mt-1.5 shrink-0',
                    m.item_type === 'nonveg' ? 'bg-destructive' : m.item_type === 'egg' ? 'bg-warning' : 'bg-success',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight line-clamp-2">{m.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {hasVariants ? `from ₹${minPrice}` : `₹${minPrice}`}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hasVariants ? 'default' : 'secondary'}
                  disabled={billRequested || addItem.isPending}
                  className="mt-3 h-9"
                  onClick={() => {
                    if (hasVariants) {
                      setVariantPick(m);
                      const def = vs!.find((v) => v.is_default) ?? vs![0];
                      setVariantSel(def.id);
                      setVariantQty(1); setVariantNote('');
                    } else {
                      addItem.mutate({ item: m, qty: 1 });
                    }
                  }}
                >
                  {hasVariants ? 'Select ▾' : '+ Add'}
                </Button>
              </div>
            );
          })}
          {filteredMenu.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-12">No items found.</p>
          )}
        </div>
      </ScrollArea>

      {/* Sticky bottom action */}
      <div className="sticky bottom-0 z-10 bg-card border-t border-border px-3 py-2 grid grid-cols-2 gap-2">
        <Button
          size="lg"
          className={cn('h-12', pendingCount === 0 && 'opacity-60')}
          disabled={pendingCount === 0 || sendKot.isPending || billRequested}
          onClick={() => setConfirmKOT(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          Send KOT {pendingCount > 0 ? `(${pendingCount})` : ''}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12"
          disabled={!hasSent || billRequested}
          onClick={() => setConfirmBill(true)}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Request bill
        </Button>
      </div>

      {/* Variant sheet */}
      <Sheet open={!!variantPick} onOpenChange={(o) => !o && setVariantPick(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{variantPick?.name}</SheetTitle>
          </SheetHeader>
          {variantPick && (
            <div className="py-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(variantsByItem.get(variantPick.id) ?? []).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantSel(v.id)}
                    className={cn(
                      'px-4 h-11 rounded-full text-sm font-medium border-2 transition-colors',
                      variantSel === v.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground',
                    )}
                  >
                    {v.name} · ₹{v.price ?? 0}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                <div className="flex items-center gap-3 mt-1">
                  <Button variant="outline" size="icon" onClick={() => setVariantQty(Math.max(1, variantQty - 1))}>−</Button>
                  <span className="text-2xl font-bold w-10 text-center">{variantQty}</span>
                  <Button variant="outline" size="icon" onClick={() => setVariantQty(variantQty + 1)}>+</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Special instructions</label>
                <Textarea value={variantNote} onChange={(e) => setVariantNote(e.target.value)} placeholder="e.g. less spicy" className="mt-1" />
              </div>
              <Button
                className="w-full h-12 text-base"
                disabled={!variantSel || addItem.isPending}
                onClick={() => {
                  const vs = variantsByItem.get(variantPick.id) ?? [];
                  const v = vs.find((x) => x.id === variantSel);
                  if (!v) return;
                  addItem.mutate({ item: variantPick, variant: v, qty: variantQty, note: variantNote });
                  setVariantPick(null);
                }}
              >
                Add to order · ₹{((variantsByItem.get(variantPick.id) ?? []).find((x) => x.id === variantSel)?.price ?? 0) * variantQty}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* KOT confirm */}
      <Sheet open={confirmKOT} onOpenChange={setConfirmKOT}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Send to kitchen?</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              {tableNumber ?? 'Table'} · {grouped.sent.length === 0 ? 'KOT #1' : `KOT #${grouped.sent.length + 1} (Add-On)`}
            </div>
            <div className="space-y-1 max-h-60 overflow-auto">
              {grouped.pending.map((r) => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span>{r.item_name}{r.variant_name ? ` (${r.variant_name})` : ''}</span>
                  <span className="font-medium">×{r.qty}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmKOT(false)}>Cancel</Button>
              <Button
                disabled={sendKot.isPending}
                onClick={() => {
                  if (!profile?.id || !restaurantId) return;
                  sendKot.mutate(
                    { orderId, waiterId: profile.id, restaurantId },
                    { onSettled: () => setConfirmKOT(false) },
                  );
                }}
              >
                {sendKot.isPending ? 'Sending…' : 'Send to kitchen →'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bill confirm */}
      <Sheet open={confirmBill} onOpenChange={setConfirmBill}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Request bill for {tableNumber}?</SheetTitle></SheetHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {items.length} items · approx. ₹{total.toFixed(0)}. You won't be able to add more items.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setConfirmBill(false)}>Cancel</Button>
              <Button disabled={requestBill.isPending} onClick={() => requestBill.mutate()}>
                {requestBill.isPending ? 'Sending…' : 'Request bill →'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ItemRowView({ row, onQty, disabled }: { row: ItemRow; onQty: (d: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {row.item_name}{row.variant_name ? ` (${row.variant_name})` : ''}
        </div>
        {row.special_instructions && (
          <div className="text-[11px] italic text-muted-foreground truncate">{row.special_instructions}</div>
        )}
        <KotChip status={row.kot_status} />
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="outline" className="h-7 w-7" disabled={disabled} onClick={() => onQty(-1)}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-semibold">{row.qty}</span>
        <Button size="icon" variant="outline" className="h-7 w-7" disabled={disabled} onClick={() => onQty(1)}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-sm font-semibold w-14 text-right">₹{(row.qty * row.unit_price).toFixed(0)}</div>
    </div>
  );
}

function KotChip({ status }: { status: string }) {
  const map: Record<string, { c: string; t: string }> = {
    pending: { c: 'bg-warning/15 text-warning border-warning/30', t: '⏳ Pending' },
    sent: { c: 'bg-info/15 text-info border-info/30', t: 'KOT sent ✓' },
    preparing: { c: 'bg-warning/15 text-warning border-warning/30', t: '👨‍🍳 Preparing' },
    ready: { c: 'bg-success/15 text-success border-success/30', t: '✅ Ready' },
    served: { c: 'bg-muted text-muted-foreground border-border', t: 'Served' },
    cancelled: { c: 'bg-destructive/15 text-destructive border-destructive/30', t: 'Cancelled' },
  };
  const v = map[status] ?? map.pending;
  return <span className={cn('inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border mt-0.5', v.c)}>{v.t}</span>;
}

function FloorPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn(
        'px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}>{label}</button>
  );
}
