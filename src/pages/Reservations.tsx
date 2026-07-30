import { useState } from 'react';
import { CalendarDays, Clock, Users, Phone, Plus, Check, X, AlertCircle, UserX, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { db, type Reservation, type WaitlistEntry } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-primary/10 text-primary border-primary/20',
  seated: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-muted',
  no_show: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
  waiting: 'bg-warning/10 text-warning border-warning/20',
  notified: 'bg-accent/10 text-accent border-accent/20',
  left: 'bg-muted text-muted-foreground',
};

export default function Reservations() {
  const [tab, setTab] = useState('reservations');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddWait, setShowAddWait] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reservations & Waitlist</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddWait(true)} className="gap-1.5">
            <Clock className="h-4 w-4" /> Add to Waitlist
          </Button>
          <Button onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Reservation
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reservations" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Reservations</TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Waitlist</TabsTrigger>
        </TabsList>
        <TabsContent value="reservations"><ReservationList /></TabsContent>
        <TabsContent value="waitlist"><WaitlistView /></TabsContent>
      </Tabs>

      <AddReservationDialog open={showAdd} onClose={() => setShowAdd(false)} />
      <AddWaitlistDialog open={showAddWait} onClose={() => setShowAddWait(false)} />
    </div>
  );
}

function ReservationList() {
  const today = new Date().toISOString().split('T')[0];
  const reservations = useLiveQuery(() => db.reservations.orderBy('date').reverse().toArray()) || [];
  const [dateFilter, setDateFilter] = useState(today);

  const filtered = reservations.filter(r => !dateFilter || r.date === dateFilter);
  const todayReservations = reservations.filter(r => r.date === today);

  const updateStatus = async (id: number, status: Reservation['status']) => {
    await db.reservations.update(id, { status });
    toast.success(`Reservation ${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Today</p><p className="text-2xl font-bold text-foreground">{todayReservations.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-2xl font-bold text-primary">{todayReservations.filter(r => r.status === 'confirmed').length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Seated</p><p className="text-2xl font-bold text-success">{todayReservations.filter(r => r.status === 'seated').length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">No-Shows</p><p className="text-2xl font-bold text-destructive">{todayReservations.filter(r => r.status === 'no_show').length}</p></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-48" />
      </div>

      <div className="space-y-2">
        {filtered.map(r => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-primary">{r.time}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{r.customer_name}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.customer_phone}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.party_size} guests</span>
                    <span>{r.date}</span>
                  </div>
                  {r.special_requests && <p className="text-xs text-muted-foreground italic mt-1">{r.special_requests}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[10px]', STATUS_COLORS[r.status])}>{r.status.replace('_', ' ').toUpperCase()}</Badge>
                {r.status === 'confirmed' && (
                  <>
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateStatus(r.id!, 'seated')}>
                      <Check className="h-3 w-3" /> Seat
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => updateStatus(r.id!, 'no_show')}>
                      <UserX className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {r.status === 'seated' && (
                  <Button size="sm" className="text-xs bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus(r.id!, 'completed')}>
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-20" /><p>No reservations for this date</p></div>}
      </div>
    </div>
  );
}

function WaitlistView() {
  const waitlist = useLiveQuery(() => db.waitlist.orderBy('created_at').toArray()) || [];
  const active = waitlist.filter(w => w.status === 'waiting' || w.status === 'notified');

  const updateStatus = async (id: number, status: WaitlistEntry['status']) => {
    await db.waitlist.update(id, { status });
    toast.success(`Guest ${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>{active.length} guests currently waiting</span>
      </div>

      <div className="space-y-2">
        {active.map((w, i) => {
          const elapsed = Math.floor((Date.now() - new Date(w.created_at).getTime()) / 60000);
          return (
            <Card key={w.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center font-bold text-warning">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{w.customer_name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span><Phone className="h-3 w-3 inline mr-1" />{w.customer_phone}</span>
                      <span><Users className="h-3 w-3 inline mr-1" />{w.party_size} guests</span>
                      <span><Clock className="h-3 w-3 inline mr-1" />{elapsed}m waiting</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {w.status === 'waiting' && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(w.id!, 'notified')}>
                      Notify
                    </Button>
                  )}
                  <Button size="sm" className="text-xs bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus(w.id!, 'seated')}>
                    Seat
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => updateStatus(w.id!, 'left')}>
                    Left
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {active.length === 0 && <div className="text-center py-12 text-muted-foreground"><Clock className="h-12 w-12 mx-auto mb-2 opacity-20" /><p>No guests in waitlist</p></div>}
      </div>
    </div>
  );
}

function AddReservationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: 2, date: new Date().toISOString().split('T')[0], time: '19:00', special_requests: '' });

  const save = async () => {
    if (!form.customer_name || !form.customer_phone) { toast.error('Name and phone required'); return; }
    await db.reservations.add({ ...form, status: 'confirmed', created_at: new Date() });
    toast.success('Reservation created');
    onClose();
    setForm({ customer_name: '', customer_phone: '', party_size: 2, date: new Date().toISOString().split('T')[0], time: '19:00', special_requests: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Reservation</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Customer Name *</Label><Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Phone *</Label><Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>Party Size</Label><Input type="number" min={1} value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: Number(e.target.value) }))} /></div>
            <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div className="space-y-1"><Label>Special Requests</Label><Textarea value={form.special_requests} onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))} className="min-h-[60px]" /></div>
        </div>
        <DialogFooter><Button onClick={save}>Create Reservation</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddWaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: 2, estimated_wait: 15, notes: '' });

  const save = async () => {
    if (!form.customer_name || !form.customer_phone) { toast.error('Name and phone required'); return; }
    await db.waitlist.add({ ...form, status: 'waiting', created_at: new Date() });
    toast.success('Added to waitlist');
    onClose();
    setForm({ customer_name: '', customer_phone: '', party_size: 2, estimated_wait: 15, notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add to Waitlist</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Phone *</Label><Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Party Size</Label><Input type="number" min={1} value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: Number(e.target.value) }))} /></div>
            <div className="space-y-1"><Label>Estimated Wait (min)</Label><Input type="number" min={5} step={5} value={form.estimated_wait} onChange={e => setForm(f => ({ ...f, estimated_wait: Number(e.target.value) }))} /></div>
          </div>
          <div className="space-y-1"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Add to Queue</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
