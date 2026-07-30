import { useState } from 'react';
import { Download, TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Users, Grid3X3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const REVENUE_DATA = [
  { time: '10AM', current: 2400, previous: 1800 },
  { time: '11AM', current: 4200, previous: 3600 },
  { time: '12PM', current: 8900, previous: 7200 },
  { time: '1PM', current: 15600, previous: 12800 },
  { time: '2PM', current: 18200, previous: 15400 },
  { time: '3PM', current: 19800, previous: 16200 },
  { time: '4PM', current: 20400, previous: 17000 },
  { time: '5PM', current: 21200, previous: 17800 },
  { time: '6PM', current: 24600, previous: 20400 },
  { time: '7PM', current: 31200, previous: 26800 },
  { time: '8PM', current: 38400, previous: 32400 },
  { time: '9PM', current: 42800, previous: 36200 },
];

const ORDER_SPLIT = [
  { name: 'Dine-In', value: 58, color: 'hsl(215, 60%, 27%)' },
  { name: 'Takeaway', value: 28, color: 'hsl(24, 90%, 44%)' },
  { name: 'Delivery', value: 14, color: 'hsl(150, 60%, 27%)' },
];

const TOP_ITEMS = [
  { name: 'Butter Chicken', qty: 42, revenue: 13440, type: 'non-veg' },
  { name: 'Paneer Tikka', qty: 38, revenue: 10640, type: 'veg' },
  { name: 'Chicken Biryani', qty: 35, revenue: 10500, type: 'non-veg' },
  { name: 'Dal Tadka', qty: 30, revenue: 5400, type: 'veg' },
  { name: 'Butter Naan', qty: 120, revenue: 7200, type: 'veg' },
  { name: 'Paneer Butter Masala', qty: 28, revenue: 7840, type: 'veg' },
  { name: 'Masala Chai', qty: 85, revenue: 3400, type: 'veg' },
  { name: 'Mutton Rogan Josh', qty: 18, revenue: 7560, type: 'non-veg' },
  { name: 'Gulab Jamun', qty: 45, revenue: 3600, type: 'veg' },
  { name: 'Fresh Lime Soda', qty: 52, revenue: 3120, type: 'veg' },
];

const PAYMENT_DATA = [
  { method: 'Cash', amount: 18500 },
  { method: 'UPI', amount: 14200 },
  { method: 'Card', amount: 7800 },
  { method: 'Other', amount: 2300 },
];

const STAFF_DATA = [
  { name: 'Raj', orders: 28, items: 86, avg_bill: 580, voids: 1, revenue: 16240 },
  { name: 'Priya', orders: 22, items: 64, avg_bill: 620, voids: 0, revenue: 13640 },
  { name: 'Amit', orders: 18, items: 52, avg_bill: 540, voids: 2, revenue: 9720 },
  { name: 'Sunita', orders: 15, items: 44, avg_bill: 490, voids: 0, revenue: 7350 },
];

const TAX_DATA = [
  { rate: '5%', taxable: 38200, cgst: 955, sgst: 955, total: 1910 },
  { rate: '12%', taxable: 0, cgst: 0, sgst: 0, total: 0 },
  { rate: '18%', taxable: 4500, cgst: 405, sgst: 405, total: 810 },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('today');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="eod">EOD</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            <KPICard title="Today's Revenue" value="₹42,800" change={18.2} icon={IndianRupee} />
            <KPICard title="Today's Orders" value="83" change={12.5} icon={ShoppingCart} />
            <KPICard title="Avg Bill Value" value="₹516" change={-3.2} icon={TrendingUp} />
            <KPICard title="Active Tables" value="4/15" change={0} icon={Grid3X3} />
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="current" stroke="hsl(215, 60%, 27%)" fill="hsl(215, 60%, 27%)" fillOpacity={0.15} name="Today" />
                  <Area type="monotone" dataKey="previous" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="4 4" name="Yesterday" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            {/* Order Split */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={ORDER_SPLIT} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {ORDER_SPLIT.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Items */}
            <Card className="col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top 10 Items</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={TOP_ITEMS} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${v}`, 'Qty']} />
                    <Bar dataKey="qty" fill="hsl(215, 60%, 27%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={PAYMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="method" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="hsl(24, 90%, 44%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SALES */}
        <TabsContent value="sales" className="space-y-3">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: '09 Apr', bill: '083', table: 'T5', items: 6, subtotal: 1340, tax: 67, total: 1407, payment: 'Cash' },
                  { date: '09 Apr', bill: '082', table: 'T2', items: 4, subtotal: 860, tax: 43, total: 903, payment: 'UPI' },
                  { date: '09 Apr', bill: '081', table: 'TKW', items: 3, subtotal: 620, tax: 31, total: 651, payment: 'Cash' },
                  { date: '09 Apr', bill: '080', table: 'T13', items: 8, subtotal: 1890, tax: 95, total: 1985, payment: 'Card' },
                  { date: '09 Apr', bill: '079', table: 'T10', items: 5, subtotal: 560, tax: 28, total: 588, payment: 'UPI' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                    <TableCell className="font-medium">#{row.bill}</TableCell>
                    <TableCell>{row.table}</TableCell>
                    <TableCell>{row.items}</TableCell>
                    <TableCell className="text-right">₹{row.subtotal}</TableCell>
                    <TableCell className="text-right text-muted-foreground">₹{row.tax}</TableCell>
                    <TableCell className="text-right font-bold">₹{row.total}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{row.payment}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ITEMS */}
        <TabsContent value="items" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Menu Item Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Food Cost</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TOP_ITEMS.map((item, i) => {
                      const margin = Math.round(60 + Math.random() * 20);
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <span className={cn("h-2.5 w-2.5 rounded-full inline-block mr-1", item.type === 'veg' ? "bg-green-600" : "bg-red-600")} />
                          </TableCell>
                          <TableCell className="text-right">{item.qty}</TableCell>
                          <TableCell className="text-right">₹{item.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">₹{Math.round(item.revenue * (100 - margin) / 100).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn("font-bold", margin >= 70 ? "text-success" : margin >= 60 ? "text-warning" : "text-destructive")}>{margin}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[9px]",
                              margin >= 70 && item.qty >= 30 ? "text-success border-success" :
                              margin >= 70 ? "text-primary border-primary" :
                              item.qty >= 30 ? "text-warning border-warning" : "text-muted-foreground"
                            )}>
                              {margin >= 70 && item.qty >= 30 ? '★ Star' :
                               margin >= 70 ? 'Plowhorse' :
                               item.qty >= 30 ? 'Puzzle' : 'Dog'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAFF */}
        <TabsContent value="staff" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Staff</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={STAFF_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                    <Bar dataKey="revenue" fill="hsl(215, 60%, 27%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waiter</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Avg Bill</TableHead>
                    <TableHead className="text-right">Voids</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STAFF_DATA.map(s => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{s.orders}</TableCell>
                      <TableCell className="text-right">{s.items}</TableCell>
                      <TableCell className="text-right">₹{s.avg_bill}</TableCell>
                      <TableCell className="text-right">{s.voids > 0 ? <span className="text-destructive">{s.voids}</span> : '0'}</TableCell>
                      <TableCell className="text-right font-bold">₹{s.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* TAX */}
        <TabsContent value="tax" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">GST Summary — {dateRange === 'today' ? 'Today' : 'This Period'}</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead className="text-right">Taxable Amount</TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">Total Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TAX_DATA.map(t => (
                      <TableRow key={t.rate}>
                        <TableCell className="font-medium">{t.rate}</TableCell>
                        <TableCell className="text-right">₹{t.taxable.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{t.cgst.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{t.sgst.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold">₹{t.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">₹{TAX_DATA.reduce((s, t) => s + t.taxable, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{TAX_DATA.reduce((s, t) => s + t.cgst, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{TAX_DATA.reduce((s, t) => s + t.sgst, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{TAX_DATA.reduce((s, t) => s + t.total, 0).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" /> Export Excel</Button>
                <Button size="sm" variant="outline" className="text-xs">GSTR-1 Format</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EOD */}
        <TabsContent value="eod" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">End of Day Report — 09 April 2026</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted"><div className="text-muted-foreground text-xs">Opening</div><div className="font-bold">10:00 AM</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="text-muted-foreground text-xs">Closing</div><div className="font-bold">11:00 PM</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="text-muted-foreground text-xs">Total Hours</div><div className="font-bold">13h</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="text-muted-foreground text-xs">Total Covers</div><div className="font-bold">142</div></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><div className="text-xs text-muted-foreground">Total Revenue</div><div className="text-xl font-bold text-primary">₹42,800</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="text-xs text-muted-foreground">Total Orders</div><div className="text-xl font-bold text-foreground">83</div></div>
                <div className="p-3 rounded-lg bg-muted"><div className="text-xs text-muted-foreground">Cash in Hand</div><div className="text-xl font-bold text-foreground">₹18,500</div></div>
              </div>
              <Separator />
              <div className="text-sm"><h4 className="font-semibold mb-2 text-foreground">Payment Summary</h4>
                <div className="grid grid-cols-4 gap-2">
                  {PAYMENT_DATA.map(p => (
                    <div key={p.method} className="p-2 rounded bg-muted text-center">
                      <div className="text-xs text-muted-foreground">{p.method}</div>
                      <div className="font-bold text-foreground">₹{p.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Print EOD Report</Button>
                <Button size="sm" variant="destructive">Close Day / Start New Shift</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ title, value, change, icon: Icon }: {
  title: string; value: string; change: number; icon: React.ElementType;
}) {
  const isUp = change > 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== 0 && (
          <div className={cn("flex items-center gap-1 text-xs mt-1", isUp ? "text-success" : "text-destructive")}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}% vs yesterday
          </div>
        )}
      </CardContent>
    </Card>
  );
}
