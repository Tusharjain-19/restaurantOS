import { useState } from 'react';
import { Receipt, Search, Eye, Printer, XCircle, Download, CreditCard, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { db, type Bill } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { ThermalReceipt } from '@/components/pos/ThermalReceipt';

export default function Billing() {
  const bills = useLiveQuery(() => db.bills.orderBy('created_at').reverse().toArray()) || [];
  const restaurant = useLiveQuery(() => db.restaurant.toCollection().first());
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [printingBill, setPrintingBill] = useState<Bill | null>(null);

  const filtered = bills.filter(b => {
    const matchesSearch = !search || b.bill_number.includes(search) || b.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || new Date(b.created_at).toISOString().split('T')[0] === dateFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const todayBills = bills.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.grand_total, 0);
  const todayCount = todayBills.length;

  const voidBill = async (bill: Bill) => {
    await db.bills.update(bill.id!, { status: 'voided', void_reason: 'Manager void' });
    toast.success('Bill voided');
    setViewBill(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">{todayCount} bills today • ₹{todayRevenue.toLocaleString()} revenue</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Today's Bills</p><p className="text-2xl font-bold">{todayCount}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-2xl font-bold">₹{todayRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Avg Bill</p><p className="text-2xl font-bold">₹{todayCount > 0 ? Math.round(todayRevenue / todayCount).toLocaleString() : 0}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Voided</p><p className="text-2xl font-bold text-destructive">{todayBills.filter(b => b.status === 'voided').length}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by bill number or customer..." className="pl-9" />
        </div>
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="generated">Unpaid</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills List */}
      <div className="space-y-1.5">
        {filtered.map(bill => (
          <Card key={bill.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewBill(bill)}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center",
                  bill.status === 'paid' ? "bg-success/10" : bill.status === 'voided' ? "bg-destructive/10" : "bg-warning/10"
                )}>
                  <Receipt className={cn("h-5 w-5",
                    bill.status === 'paid' ? "text-success" : bill.status === 'voided' ? "text-destructive" : "text-warning"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{bill.bill_number}</span>
                    <Badge variant="outline" className={cn("text-[10px]",
                      bill.status === 'paid' ? "text-success border-success/30" : bill.status === 'voided' ? "text-destructive border-destructive/30 line-through" : "text-warning border-warning/30"
                    )}>{bill.status.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bill.table_number && `${bill.table_number} • `}{bill.order_type} • {new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {bill.customer_name && ` • ${bill.customer_name}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={cn("font-bold", bill.status === 'voided' ? "line-through text-muted-foreground" : "text-foreground")}>₹{bill.grand_total.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{bill.payment_method}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No bills found</p>
          </div>
        )}
      </div>

      {/* Bill Detail / Print Preview */}
      <Dialog open={!!viewBill} onOpenChange={() => setViewBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bill Preview</DialogTitle></DialogHeader>
          {viewBill && (
            <div className="border rounded-lg p-6 bg-white text-black font-mono text-xs space-y-3 print:border-none print:shadow-none" id="bill-print">
              {/* Header */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold">{restaurant?.name || 'RestaurantOS'}</h2>
                {restaurant?.address && <p>{restaurant.address}</p>}
                {restaurant?.phone && <p>Ph: {restaurant.phone}</p>}
                {restaurant?.gstin && <p>GSTIN: {restaurant.gstin}</p>}
                {restaurant?.fssai_license && <p>FSSAI: {restaurant.fssai_license}</p>}
              </div>
              <div className="border-b border-dashed border-gray-400" />

              {/* Bill info */}
              <div className="flex justify-between">
                <span>Bill: {viewBill.bill_number}</span>
                <span>{new Date(viewBill.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{viewBill.table_number || viewBill.order_type}</span>
                <span>{new Date(viewBill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {viewBill.customer_name && <p>Customer: {viewBill.customer_name}</p>}
              <div className="border-b border-dashed border-gray-400" />

              {/* Items */}
              <table className="w-full">
                <thead><tr className="border-b border-gray-300"><th className="text-left py-1">Item</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Amt</th></tr></thead>
                <tbody>
                  {viewBill.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-0.5">{item.name}{item.variant ? ` [${item.variant}]` : ''}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{item.rate}</td>
                      <td className="text-right">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-b border-dashed border-gray-400" />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{viewBill.subtotal.toFixed(2)}</span></div>
                {viewBill.discount_amount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{viewBill.discount_amount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>CGST @2.5%</span><span>₹{viewBill.cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @2.5%</span><span>₹{viewBill.sgst.toFixed(2)}</span></div>
                {viewBill.service_charge > 0 && <div className="flex justify-between"><span>Service Charge</span><span>₹{viewBill.service_charge.toFixed(2)}</span></div>}
                <div className="border-b border-double border-gray-400" />
                <div className="flex justify-between font-bold text-sm"><span>Grand Total</span><span>₹{viewBill.grand_total}</span></div>
              </div>
              <div className="border-b border-dashed border-gray-400" />

              <div className="flex justify-between"><span>Payment: {viewBill.payment_method}</span></div>

              <div className="text-center space-y-1 pt-2">
                <p>Thank you for dining with us!</p>
                <p className="text-[10px] text-gray-500">Powered by RestaurantOS</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 p-4 pt-0">
            <Button className="flex-1 gap-1" onClick={() => { setPrintingBill(viewBill); setViewBill(null); }}>
              <Printer className="h-4 w-4" /> Print Real Bill
            </Button>
            {viewBill?.status === 'paid' && (
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => viewBill && voidBill(viewBill)}>
                <XCircle className="h-4 w-4" /> Void
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Professional Thermal Receipt Component */}
      {printingBill && (
        <ThermalReceipt 
          bill={printingBill} 
          restaurant={restaurant} 
          onClose={() => setPrintingBill(null)} 
        />
      )}
    </div>
  );
}
