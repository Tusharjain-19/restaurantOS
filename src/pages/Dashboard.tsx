import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, Users, ShoppingCart, IndianRupee, AlertTriangle, Clock, UtensilsCrossed, Package, Truck, Star, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const PIE_COLORS = ['hsl(215, 60%, 50%)', 'hsl(24, 90%, 50%)', 'hsl(150, 60%, 40%)', 'hsl(45, 93%, 52%)'];

export default function Dashboard() {
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const ingredients = useLiveQuery(() => db.ingredients.toArray()) || [];
  const tables = useLiveQuery(() => db.restaurantTables.toArray()) || [];
  const staff = useLiveQuery(() => db.staff.filter(s => s.is_active).toArray()) || [];
  const kots = useLiveQuery(() => db.kots.toArray()) || [];

  const today = new Date();
  const todayStr = today.toDateString();
  const yesterdayStr = new Date(today.getTime() - 86400000).toDateString();

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
  const yesterdayOrders = orders.filter(o => new Date(o.created_at).toDateString() === yesterdayStr);

  const todayRevenue = todayOrders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0);
  const yesterdayRevenue = yesterdayOrders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0);
  const revenueChange = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

  const todayOrderCount = todayOrders.length;
  const yesterdayOrderCount = yesterdayOrders.length;
  const orderChange = yesterdayOrderCount > 0 ? Math.round(((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100) : 0;

  const activeTables = tables.filter(t => t.status === 'occupied').length;
  const totalTables = tables.length;

  const avgOrderValue = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

  const lowStockItems = ingredients.filter(i => i.status === 'low' || i.status === 'out');
  const pendingKots = kots.filter(k => k.status === 'received' || k.status === 'in_preparation');

  // Revenue by hour
  const revenueByHour = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    const hourOrders = todayOrders.filter(o => new Date(o.created_at).getHours() === hour && o.status === 'paid');
    return { time: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`, revenue: hourOrders.reduce((s, o) => s + o.total, 0) };
  });

  // Orders by type
  const dineInCount = todayOrders.filter(o => o.order_type === 'dine_in').length;
  const takeawayCount = todayOrders.filter(o => o.order_type === 'takeaway').length;
  const deliveryCount = todayOrders.filter(o => o.order_type === 'delivery').length;
  const orderTypeData = [
    { name: 'Dine-In', value: dineInCount },
    { name: 'Takeaway', value: takeawayCount },
    { name: 'Delivery', value: deliveryCount },
  ].filter(d => d.value > 0);

  // Weekly trend
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = weekDays.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (today.getDay() - i));
    const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString() && o.status === 'paid');
    return {
      day,
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Payment method breakdown
  const paymentBreakdown = todayOrders.filter(o => o.status === 'paid').reduce((acc, o) => {
    const method = o.payment_method || 'Cash';
    acc[method] = (acc[method] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }));

  const stats = [
    { title: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, positive: revenueChange >= 0, subtitle: `Yesterday: ₹${yesterdayRevenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Orders Today', value: todayOrderCount.toString(), change: `${orderChange >= 0 ? '+' : ''}${orderChange}%`, positive: orderChange >= 0, subtitle: `Yesterday: ${yesterdayOrderCount}`, icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-600' },
    { title: 'Active Tables', value: `${activeTables}/${totalTables}`, change: '', positive: true, subtitle: `${totalTables - activeTables} available`, icon: LayoutDashboard, color: 'bg-purple-500/10 text-purple-600' },
    { title: 'Avg Order Value', value: `₹${avgOrderValue}`, change: '', positive: true, subtitle: `${todayOrderCount} orders`, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Offline — All data stored locally
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                {s.change && (
                  <Badge variant="outline" className={`text-[10px] ${s.positive ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}`}>
                    {s.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {s.change}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{s.title}</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Row */}
      {(lowStockItems.length > 0 || pendingKots.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {lowStockItems.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">{lowStockItems.map(i => i.name).join(', ')}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-warning border-warning/30">{lowStockItems.length}</Badge>
              </CardContent>
            </Card>
          )}
          {pendingKots.length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-4 flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pending Kitchen Orders</p>
                  <p className="text-xs text-muted-foreground">{pendingKots.length} KOTs waiting</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Today's Revenue (by Hour)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Order Types Pie */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Order Types</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {orderTypeData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {orderTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {orderTypeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-foreground">{d.name}</span>
                      <span className="font-bold text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8">No orders today</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentData.length > 0 ? paymentData.map(p => (
                <div key={p.name} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{p.name}</span>
                  <span className="font-bold text-sm text-foreground">₹{p.value.toLocaleString()}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground py-4 text-center">No payments today</p>}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" />Active Staff</div>
                <span className="font-bold text-foreground">{staff.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-muted-foreground" />Low Stock Items</div>
                <Badge variant={lowStockItems.length > 0 ? "destructive" : "outline"}>{lowStockItems.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-muted-foreground" />Delivery Orders</div>
                <span className="font-bold text-foreground">{todayOrders.filter(o => o.order_type === 'delivery').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-muted-foreground" />Takeaway</div>
                <span className="font-bold text-foreground">{todayOrders.filter(o => o.order_type === 'takeaway').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
