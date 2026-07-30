import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, Phone, Mail, Calendar, Clock, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { db, type StaffMember } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-red-500/10 text-red-600 border-red-200' },
  manager: { label: 'Manager', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  captain: { label: 'Captain', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  cashier: { label: 'Cashier', color: 'bg-green-500/10 text-green-600 border-green-200' },
  kitchen: { label: 'Kitchen', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  delivery: { label: 'Delivery', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
};

const SHIFT_LABELS: Record<string, string> = {
  morning: '🌅 Morning (6AM - 2PM)',
  afternoon: '☀️ Afternoon (2PM - 10PM)',
  night: '🌙 Night (10PM - 6AM)',
  full: '📋 Full Day',
};

export default function Staff() {
  const allStaff = useLiveQuery(() => db.staff.toArray()) || [];
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editStaff, setEditStaff] = useState<Partial<StaffMember> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = allStaff.filter(s => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = allStaff.filter(s => s.is_active).length;

  const saveStaff = async () => {
    if (!editStaff?.name || !editStaff?.phone || !editStaff?.pin) {
      toast.error('Please fill all required fields');
      return;
    }
    if (editStaff.id) {
      await db.staff.update(editStaff.id, editStaff);
      toast.success('Staff member updated');
    } else {
      await db.staff.add({
        ...editStaff as any,
        is_active: true,
        created_at: new Date(),
        joining_date: editStaff.joining_date || new Date(),
      });
      toast.success('Staff member added');
    }
    setEditStaff(null);
    setShowForm(false);
  };

  const toggleActive = async (staff: StaffMember) => {
    await db.staff.update(staff.id!, { is_active: !staff.is_active });
    toast.success(staff.is_active ? 'Staff deactivated' : 'Staff activated');
  };

  const deleteStaff = async (id: number) => {
    await db.staff.delete(id);
    toast.success('Staff member removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">{activeCount} active of {allStaff.length} total staff</p>
        </div>
        <Button onClick={() => {
          setEditStaff({ name: '', phone: '', role: 'captain', pin: '', shift: 'full', salary: 0 });
          setShowForm(true);
        }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => {
          const count = allStaff.filter(s => s.role === role && s.is_active).length;
          return (
            <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(role === roleFilter ? 'all' : role)}>
              <CardContent className="p-3 text-center">
                <div className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${color} mb-1`}>{label}</div>
                <div className="text-xl font-bold text-foreground">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff by name or phone..." className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(staff => {
          const roleInfo = ROLE_LABELS[staff.role] || ROLE_LABELS.captain;
          return (
            <Card key={staff.id} className={`transition-all hover:shadow-md ${!staff.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{staff.name}</div>
                      <Badge className={`text-[10px] h-5 ${roleInfo.color}`} variant="outline">{roleInfo.label}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {staff.is_active ? (
                      <UserCheck className="h-4 w-4 text-success" />
                    ) : (
                      <UserX className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{staff.phone}</div>
                  {staff.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{staff.email}</div>}
                  <div className="flex items-center gap-2"><Clock className="h-3 w-3" />{SHIFT_LABELS[staff.shift || 'full']}</div>
                  <div className="flex items-center gap-2"><Shield className="h-3 w-3" />PIN: {staff.pin}</div>
                  {staff.salary ? <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />₹{staff.salary?.toLocaleString()}/month</div> : null}
                </div>

                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setEditStaff(staff); setShowForm(true); }}>
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggleActive(staff)}>
                    {staff.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteStaff(staff.id!)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-1">No staff found</p>
          <p className="text-sm">Add staff members to manage roles and access</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editStaff?.id ? 'Edit Staff Member' : 'Add New Staff'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Full Name *</Label><Input value={editStaff?.name || ''} onChange={e => setEditStaff(f => f ? ({ ...f, name: e.target.value }) : null)} placeholder="Rajesh Kumar" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Phone *</Label><Input value={editStaff?.phone || ''} onChange={e => setEditStaff(f => f ? ({ ...f, phone: e.target.value }) : null)} placeholder="9876543210" /></div>
              <div className="space-y-1"><Label>Email</Label><Input value={editStaff?.email || ''} onChange={e => setEditStaff(f => f ? ({ ...f, email: e.target.value }) : null)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Role *</Label>
                <Select value={editStaff?.role} onValueChange={v => setEditStaff(f => f ? ({ ...f, role: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Shift</Label>
                <Select value={editStaff?.shift || 'full'} onValueChange={v => setEditStaff(f => f ? ({ ...f, shift: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="full">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>4-Digit PIN *</Label><Input type="text" maxLength={4} value={editStaff?.pin || ''} onChange={e => setEditStaff(f => f ? ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }) : null)} placeholder="1234" /></div>
              <div className="space-y-1"><Label>Password</Label><Input type="text" value={editStaff?.password_hash || ''} onChange={e => setEditStaff(f => f ? ({ ...f, password_hash: e.target.value }) : null)} placeholder="For dashboard login" /></div>
            </div>
            <div className="space-y-1"><Label>Monthly Salary (₹)</Label><Input type="number" value={editStaff?.salary || ''} onChange={e => setEditStaff(f => f ? ({ ...f, salary: Number(e.target.value) }) : null)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={saveStaff}>Save Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
