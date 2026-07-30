import { useState } from 'react';
import { Truck, Phone, MapPin, Clock, Package, CheckCircle2, XCircle, Search, Plus, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db, type Order } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'Preparing', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  billed: { label: 'Ready for Pickup', color: 'bg-accent/10 text-accent border-accent/30', icon: Package },
  paid: { label: 'Delivered', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
};

export default function Delivery() {
  const orders = useLiveQuery(() =>
    db.orders.where('order_type').equals('delivery').reverse().sortBy('created_at')
  ) || [];
  const staff = useLiveQuery(() => db.staff.where('role').equals('delivery').toArray()) || [];
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search) ||
      o.order_number.includes(search);
    return matchesStatus && matchesSearch;
  });

  const activeOrders = orders.filter(o => o.status === 'active').length;
  const readyOrders = orders.filter(o => o.status === 'billed').length;
  const deliveredToday = orders.filter(o => {
    if (o.status !== 'paid') return false;
    const today = new Date();
    return o.paid_at && new Date(o.paid_at).toDateString() === today.toDateString();
  }).length;

  const todayRevenue = orders.filter(o => {
    if (o.status !== 'paid') return false;
    const today = new Date();
    return o.paid_at && new Date(o.paid_at).toDateString() === today.toDateString();
  }).reduce((sum, o) => sum + o.total, 0);

  const updateStatus = async (order: Order, newStatus: Order['status']) => {
    const updates: Partial<Order> = { status: newStatus, updated_at: new Date() };
    if (newStatus === 'paid') updates.paid_at = new Date();
    await db.orders.update(order.id!, updates);
    toast.success(`Order ${order.order_number} ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Orders</h1>
          <p className="text-sm text-muted-foreground">{activeOrders} active • {readyOrders} ready for pickup</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Preparing</p><p className="text-xl font-bold">{activeOrders}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Package className="h-5 w-5 text-accent" /></div>
            <div><p className="text-xs text-muted-foreground">Ready</p><p className="text-xl font-bold">{readyOrders}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Delivered Today</p><p className="text-xl font-bold">{deliveredToday}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Today's Revenue</p><p className="text-xl font-bold">₹{todayRevenue.toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, phone, or order number..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="active">Preparing</SelectItem>
            <SelectItem value="billed">Ready</SelectItem>
            <SelectItem value="paid">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filtered.map(order => {
          const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.active;
          const StatusIcon = statusInfo.icon;
          const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);

          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${statusInfo.color}`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{order.order_number}</span>
                        <Badge variant="outline" className={cn('text-[10px] h-5', statusInfo.color)}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {order.customer_name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.customer_name}</span>}
                        {order.customer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{order.customer_phone}</span>}
                        {order.delivery_address && <span className="flex items-center gap-1 max-w-[200px] truncate"><MapPin className="h-3 w-3 shrink-0" />{order.delivery_address}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-foreground">₹{order.total.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{elapsed}m ago</div>
                    </div>

                    <div className="flex gap-1">
                      {order.status === 'active' && (
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateStatus(order, 'billed')}>
                          <Package className="h-3 w-3" /> Ready
                        </Button>
                      )}
                      {order.status === 'billed' && (
                        <Button size="sm" className="text-xs gap-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus(order, 'paid')}>
                          <CheckCircle2 className="h-3 w-3" /> Delivered
                        </Button>
                      )}
                      {(order.status === 'active' || order.status === 'billed') && (
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => updateStatus(order, 'cancelled')}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Truck className="h-16 w-16 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No delivery orders</p>
            <p className="text-sm">Delivery orders placed from POS will appear here</p>
          </div>
        )}
      </div>

      {/* Delivery Staff */}
      {staff.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Delivery Staff</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {staff.map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-600">
                    {s.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
