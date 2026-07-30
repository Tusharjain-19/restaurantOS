import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Crown, Medal, Award, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string | null;
  tier: Tier;
  total_points: number;
  total_visits: number;
  total_spent: number;
  last_visit: string;
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; icon: typeof Crown }> = {
  bronze: { label: 'Bronze', color: 'bg-amber-700/20 text-amber-700 border-amber-700/30', icon: Medal },
  silver: { label: 'Silver', color: 'bg-gray-400/20 text-gray-600 border-gray-400/30', icon: Award },
  gold: { label: 'Gold', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30', icon: Star },
  platinum: { label: 'Platinum', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30', icon: Crown },
};

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Priya Sharma', phone: '9876543210', email: 'priya@email.com', birthday: '1990-03-15', tier: 'platinum', total_points: 6200, total_visits: 48, total_spent: 72400, last_visit: '2026-04-09' },
  { id: 'c2', name: 'Rahul Verma', phone: '9876543211', email: 'rahul@email.com', birthday: '1985-07-22', tier: 'gold', total_points: 3100, total_visits: 28, total_spent: 38500, last_visit: '2026-04-08' },
  { id: 'c3', name: 'Anita Desai', phone: '9876543212', email: 'anita@email.com', birthday: '1992-11-05', tier: 'silver', total_points: 1200, total_visits: 14, total_spent: 16800, last_visit: '2026-04-05' },
  { id: 'c4', name: 'Vikram Singh', phone: '9876543213', email: '', birthday: null, tier: 'gold', total_points: 2800, total_visits: 22, total_spent: 31200, last_visit: '2026-04-07' },
  { id: 'c5', name: 'Meena Patel', phone: '9876543214', email: 'meena@email.com', birthday: '1988-01-12', tier: 'bronze', total_points: 350, total_visits: 5, total_spent: 4200, last_visit: '2026-03-28' },
  { id: 'c6', name: 'Suresh Kumar', phone: '9876543215', email: '', birthday: null, tier: 'silver', total_points: 890, total_visits: 11, total_spent: 12600, last_visit: '2026-04-02' },
  { id: 'c7', name: 'Deepa Nair', phone: '9876543216', email: 'deepa@email.com', birthday: '1995-06-18', tier: 'bronze', total_points: 120, total_visits: 3, total_spent: 2800, last_visit: '2026-04-01' },
  { id: 'c8', name: 'Arjun Reddy', phone: '9876543217', email: 'arjun@email.com', birthday: '1991-09-30', tier: 'platinum', total_points: 8500, total_visits: 62, total_spent: 94200, last_visit: '2026-04-10' },
];

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', birthday: '' });

  const filtered = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [search, tierFilter]);

  const handleAdd = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and phone are required');
      return;
    }
    toast.success(`Customer "${newCustomer.name}" added`);
    setAddOpen(false);
    setNewCustomer({ name: '', phone: '', email: '', birthday: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: MOCK_CUSTOMERS.length },
          { label: 'Platinum Members', value: MOCK_CUSTOMERS.filter(c => c.tier === 'platinum').length },
          { label: 'Active This Month', value: MOCK_CUSTOMERS.filter(c => c.last_visit >= '2026-04-01').length },
          { label: 'Avg Spend', value: `₹${Math.round(MOCK_CUSTOMERS.reduce((s, c) => s + c.total_spent / c.total_visits, 0) / MOCK_CUSTOMERS.length)}` },
        ].map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-36 h-9"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Visits</TableHead>
              <TableHead className="hidden md:table-cell">Total Spent</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="hidden md:table-cell">Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const tier = TIER_CONFIG[c.tier];
              const TierIcon = tier.icon;
              return (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/customers/${c.id}`)}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.total_visits}</TableCell>
                  <TableCell className="hidden md:table-cell">₹{c.total_spent.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{c.total_points}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px]', tier.color)}>
                      <TierIcon className="h-3 w-3 mr-0.5" /> {tier.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{c.last_visit}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Phone *</Label><Input value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Birthday</Label><Input type="date" value={newCustomer.birthday} onChange={e => setNewCustomer(p => ({ ...p, birthday: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
