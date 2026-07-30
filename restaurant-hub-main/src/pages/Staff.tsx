import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, RefreshCw, UserCircle2 } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  staff_id: string | null;
  pin: string | null;
  role: string;
  is_active: boolean;
  shift: string | null;
  salary: number | null;
  created_at: string;
}

const ROLES = [
  { value: 'captain', label: 'Waiter (Captain)' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'manager', label: 'Manager' },
  { value: 'delivery', label: 'Delivery' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', staff_id: '', pin: '',
    role: 'captain', salary: '', shift: 'full',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    setStaff((data ?? []) as Staff[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({
    name: '', email: '', phone: '', staff_id: '', pin: '',
    role: 'captain', salary: '', shift: 'full',
  });

  const create = async () => {
    if (!form.name || !form.email || !form.staff_id || !form.pin) {
      toast.error('Name, email, Staff ID and PIN are required'); return;
    }
    if (form.pin.length < 4) { toast.error('PIN must be 4–6 digits'); return; }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('admin-create-staff', {
      body: {
        name: form.name, email: form.email, phone: form.phone || null,
        staff_id: form.staff_id, pin: form.pin, role: form.role,
        salary: form.salary ? Number(form.salary) : null,
        shift: form.shift,
      },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? 'Failed');
      return;
    }
    toast.success('Staff created');
    setDialogOpen(false);
    resetForm();
    load();
  };

  const toggleActive = async (s: Staff) => {
    await supabase.from('staff').update({ is_active: !s.is_active }).eq('id', s.id);
    load();
  };
  const remove = async (s: Staff) => {
    if (!confirm(`Deactivate ${s.name}? (Auth user stays — login disabled)`)) return;
    await supabase.from('staff').update({ is_active: false }).eq('id', s.id);
    load();
  };

  const grouped = {
    captain: staff.filter(s => s.role === 'captain'),
    kitchen: staff.filter(s => s.role === 'kitchen'),
    other: staff.filter(s => !['captain', 'kitchen'].includes(s.role)),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Create waiter, kitchen and other staff accounts for your restaurant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5 col-span-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ramesh Kumar" /></div>
                <div className="space-y-1.5"><Label>Staff ID</Label>
                  <Input value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value.toUpperCase() }))} placeholder="W001 / K001" /></div>
                <div className="space-y-1.5"><Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@restaurant.local" /></div>
                <div className="space-y-1.5"><Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91…" /></div>
                <div className="space-y-1.5"><Label>PIN (4–6 digits)</Label>
                  <Input value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="1234" /></div>
                <div className="space-y-1.5"><Label>Shift</Label>
                  <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2"><Label>Monthly Salary (optional)</Label>
                  <Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="15000" /></div>
              </div>
              <Button className="w-full mt-3" onClick={create} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Account'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Login: <code>{form.role === 'kitchen' ? '/kitchen/login' : '/waiter/login'}</code> with Staff ID + PIN
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : (
        <>
          <Section title="Waiters" items={grouped.captain} onToggle={toggleActive} onRemove={remove} loginHint="/waiter/login" />
          <Section title="Kitchen" items={grouped.kitchen} onToggle={toggleActive} onRemove={remove} loginHint="/kitchen/login" />
          <Section title="Other Staff" items={grouped.other} onToggle={toggleActive} onRemove={remove} loginHint="/login" />
        </>
      )}
    </div>
  );
}

function Section({ title, items, onToggle, onRemove, loginHint }: {
  title: string; items: Staff[]; onToggle: (s: Staff) => void; onRemove: (s: Staff) => void; loginHint: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title} <span className="text-muted-foreground text-sm">({items.length})</span></h2>
        <code className="text-xs text-muted-foreground">{loginHint}</code>
      </div>
      {items.length === 0 ? (
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">No {title.toLowerCase()} yet</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {items.map(s => (
            <Card key={s.id} className={s.is_active ? '' : 'opacity-50'}>
              <CardContent className="py-3 flex items-center gap-4">
                <UserCircle2 className="h-9 w-9 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{s.name}</span>
                    <Badge variant="outline" className="text-xs">{s.staff_id}</Badge>
                    <Badge variant={s.is_active ? 'default' : 'secondary'} className="text-xs">{s.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.email} {s.phone && `· ${s.phone}`} · PIN: <code>{s.pin}</code> · Shift: {s.shift}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onToggle(s)}>
                  {s.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onRemove(s)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
