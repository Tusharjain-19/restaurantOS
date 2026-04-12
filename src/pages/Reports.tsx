import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, IndianRupee, ShoppingCart, Users, Package, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';

const CHART_COLORS = ['hsl(215, 60%, 50%)', 'hsl(24, 90%, 50%)', 'hsl(150, 60%, 40%)', 'hsl(280, 60%, 55%)', 'hsl(45, 93%, 52%)', 'hsl(0, 70%, 50%)'];

export default function Reports() {
  const [tab, setTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const bills = useLiveQuery(() => db.bills.toArray()) || [];
  const items = useLiveQuery(() => db.orderItems.toArray()) || [];
  const ingredients = useLiveQuery(() => db.ingredients.toArray()) || [];
  const wastageLogs = useLiveQuery(() => db.wastageLogs.toArray()) || [];
  const menuItems = useLiveQuery(() => db.menuItems.toArray()) || [];
  const categories = useLiveQuery(() => db.menuCategories.toArray()) || [];

  const paidOrders = useMemo(() => orders.filter(o => o.status === 'paid'), [orders]);

  const today = new Date().toDateString();
  const todayOrders = paidOrders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayOrderCount = todayOrders.length;
  const avgOrderValue = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

  // Last 7 days revenue
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toDateString();
    const dayOrders = paidOrders.filter(o => new Date(o.created_at).toDateString() === dStr);
    return {
      date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Revenue by order type
  const orderTypeRevenue = [
    { name: 'Dine-In', value: paidOrders.filter(o => o.order_type === 'dine_in').reduce((s, o) => s + o.total, 0) },
    { name: 'Takeaway', value: paidOrders.filter(o => o.order_type === 'takeaway').reduce((s, o) => s + o.total, 0) },
    { name: 'Delivery', value: paidOrders.filter(o => o.order_type === 'delivery').reduce((s, o) => s + o.total, 0) },
  ].filter(d => d.value > 0);

  // Payment method split
  const paymentSplit = paidOrders.reduce((acc, o) => {
    const method = o.payment_method || 'Cash';
    acc[method] = (acc[method] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);
  const paymentData = Object.entries(paymentSplit).map(([name, value]) => ({ name, value }));

  // Hourly distribution
  const hourlyData = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    const hourOrders = todayOrders.filter(o => new Date(o.created_at).getHours() === hour);
    return { hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`, orders: hourOrders.length, revenue: hourOrders.reduce((s, o) => s + o.total, 0) };
  });

  // Inventory value by category
  const inventoryByCategory = [...new Set(ingredients.map(i => i.category))].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: ingredients.filter(i => i.category === cat).reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0),
  }));

  const totalWasteCost = wastageLogs.reduce((s, w) => s + w.cost, 0);
  const totalInventoryValue = ingredients.reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0);
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = paidOrders.length;

  const exportCSV = () => {
    const header = 'Order#,Date,Type,Customer,Subtotal,Tax,Total,Payment,Status\n';
    const rows = paidOrders.map(o =>
      `${o.order_number},${new Date(o.created_at).toLocaleDateString()},${o.order_type},${o.customer_name || '-'},${o.subtotal},${o.tax_amount},${o.total},${o.payment_method},${o.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `restaurant_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive business insights</p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Today's Revenue</p><p className="text-2xl font-bold text-foreground">₹{todayRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold text-foreground">{todayOrderCount}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Avg Order Value</p><p className="text-2xl font-bold text-foreground">₹{avgOrderValue}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Inventory Value</p><p className="text-2xl font-bold text-foreground">₹{totalInventoryValue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Wastage Cost</p><p className="text-2xl font-bold text-destructive">₹{totalWasteCost.toLocaleString()}</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-auto">
          <TabsTrigger value="daily" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" />Revenue</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs gap-1"><ShoppingCart className="h-3.5 w-3.5" />Orders</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs gap-1"><Package className="h-3.5 w-3.5" />Inventory</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs gap-1"><FileText className="h-3.5 w-3.5" />Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">7-Day Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Order Type</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                {orderTypeRevenue.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={orderTypeRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                          {orderTypeRevenue.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {orderTypeRevenue.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          <span className="text-foreground">{d.name}</span>
                          <span className="font-bold text-foreground">₹{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-muted-foreground py-8">No data yet</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by Hour (Today)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                {paymentData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                          {paymentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {paymentData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          <span className="text-foreground">{d.name}</span>
                          <span className="font-bold">₹{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-muted-foreground py-8">No data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Value by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={inventoryByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Value']} />
                    <Bar dataKey="value" fill="hsl(24, 90%, 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Stock Status Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['normal', 'low', 'out'].map(status => {
                    const count = ingredients.filter(i => i.status === status).length;
                    const total = ingredients.length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium text-foreground">{status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'Normal'}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${status === 'normal' ? 'bg-success' : status === 'low' ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader><CardTitle className="text-sm">Business Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Total Lifetime Revenue</p><p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p></div>
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold text-foreground">{totalOrders}</p></div>
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Avg Order Value</p><p className="text-2xl font-bold text-foreground">₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</p></div>
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Menu Items</p><p className="text-2xl font-bold text-foreground">{menuItems.length}</p></div>
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Categories</p><p className="text-2xl font-bold text-foreground">{categories.length}</p></div>
                <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Total Wastage</p><p className="text-2xl font-bold text-destructive">₹{totalWasteCost.toLocaleString()}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
