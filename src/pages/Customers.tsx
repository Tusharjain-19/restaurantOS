import { useState } from 'react';
import { Search, Plus, Star, Crown, Award, Phone, Mail, TrendingUp, User, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { db, type Customer } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  bronze: { label: 'Bronze', icon: Award, color: 'text-amber-700', bg: 'bg-amber-100' },
  silver: { label: 'Silver', icon: Star, color: 'text-gray-500', bg: 'bg-gray-100' },
  gold: { label: 'Gold', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  platinum: { label: 'Platinum', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' },
};

export default function Customers() {
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [editCustomer, setEditCustomer] = useState<Partial<Customer> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => !c.is_blacklisted).length,
    totalPoints: customers.reduce((s, c) => s + c.loyalty_points, 0),
    totalSpend: customers.reduce((s, c) => s + c.total_spend, 0),
  };

  const saveCustomer = async () => {
    if (!editCustomer?.name || !editCustomer?.phone) { toast.error('Name and phone required'); return; }
    if (editCustomer.id) {
      await db.customers.update(editCustomer.id, editCustomer);
    } else {
      await db.customers.add({
        ...editCustomer as any,
        total_visits: 0, total_spend: 0, loyalty_points: 0,
        tier: 'bronze', is_blacklisted: false, created_at: new Date(),
      });
    }
    setEditCustomer(null);
    setShowForm(false);
    toast.success('Customer saved');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers & Loyalty</h1>
          <p className="text-sm text-muted-foreground">{stats.total} customers • {stats.totalPoints.toLocaleString()} points issued</p>
        </div>
        <Button onClick={() => { setEditCustomer({ name: '', phone: '', tier: 'bronze' }); setShowForm(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Customers</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Loyalty Points</p><p className="text-2xl font-bold text-primary">{stats.totalPoints.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Lifetime Revenue</p><p className="text-2xl font-bold">₹{stats.totalSpend.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Avg. per Customer</p><p className="text-2xl font-bold">₹{stats.total > 0 ? Math.round(stats.totalSpend / stats.total).toLocaleString() : 0}</p></CardContent></Card>
      </div>

      {/* Tier distribution */}
      <div className="flex gap-3">
        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
          const count = customers.filter(c => c.tier === tier).length;
          return (
            <button key={tier} onClick={() => setTierFilter(tier === tierFilter ? 'all' : tier)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                tierFilter === tier ? "border-primary bg-primary/5" : "hover:bg-muted"
              )}>
              <config.icon className={cn("h-4 w-4", config.color)} />
              <span className="text-xs font-medium">{config.label}</span>
              <Badge variant="outline" className="text-[10px]">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="pl-9" />
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(customer => {
          const tierConfig = TIER_CONFIG[customer.tier] || TIER_CONFIG.bronze;
          const TierIcon = tierConfig.icon;
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/customers/${customer.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{customer.name}</div>
                      <div className="flex items-center gap-1">
                        <TierIcon className={cn("h-3 w-3", tierConfig.color)} />
                        <span className={cn("text-[10px] font-medium", tierConfig.color)}>{tierConfig.label}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    <Star className="h-2.5 w-2.5 mr-0.5 text-primary" />{customer.loyalty_points}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-1.5">
                    <p className="text-[10px] text-muted-foreground">Visits</p>
                    <p className="text-sm font-bold text-foreground">{customer.total_visits}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-1.5">
                    <p className="text-[10px] text-muted-foreground">Spent</p>
                    <p className="text-sm font-bold text-foreground">₹{customer.total_spend.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-1.5">
                    <p className="text-[10px] text-muted-foreground">Points</p>
                    <p className="text-sm font-bold text-primary">{customer.loyalty_points}</p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" />{customer.phone}
                  {customer.last_visit && <span>• Last: {new Date(customer.last_visit).toLocaleDateString()}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No customers found</p>
          <p className="text-xs">Add customers to start tracking loyalty</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCustomer?.id ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Name *</Label><Input value={editCustomer?.name || ''} onChange={e => setEditCustomer(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
              <div className="space-y-1"><Label>Phone *</Label><Input value={editCustomer?.phone || ''} onChange={e => setEditCustomer(f => f ? ({ ...f, phone: e.target.value }) : null)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Email</Label><Input value={editCustomer?.email || ''} onChange={e => setEditCustomer(f => f ? ({ ...f, email: e.target.value }) : null)} /></div>
              <div className="space-y-1"><Label>Birthday</Label><Input type="date" value={editCustomer?.birthday ? new Date(editCustomer.birthday).toISOString().split('T')[0] : ''} onChange={e => setEditCustomer(f => f ? ({ ...f, birthday: new Date(e.target.value) }) : null)} /></div>
            </div>
            <div className="space-y-1"><Label>Address</Label><Input value={editCustomer?.address || ''} onChange={e => setEditCustomer(f => f ? ({ ...f, address: e.target.value }) : null)} /></div>
            <div className="space-y-1"><Label>Notes</Label><Input value={editCustomer?.notes || ''} onChange={e => setEditCustomer(f => f ? ({ ...f, notes: e.target.value }) : null)} /></div>
          </div>
          <DialogFooter><Button onClick={saveCustomer}>Save Customer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
