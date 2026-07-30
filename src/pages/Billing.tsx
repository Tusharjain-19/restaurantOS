import { useState } from 'react';
import { Printer, MessageCircle, Mail, X, Check, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurantData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const MOCK_ORDER = {
  id: 'ord-001',
  table: 'T5',
  cashier: 'Raj',
  covers: 3,
  time: '14:32',
  date: '09 Apr 26',
  items: [
    { name: 'Paneer Tikka', variant: 'Half', qty: 2, rate: 200, amount: 400, tax_rate: 5 },
    { name: 'Dal Tadka', qty: 1, rate: 180, amount: 180, tax_rate: 5 },
    { name: 'Butter Naan', qty: 3, rate: 60, amount: 180, tax_rate: 5 },
    { name: 'Chicken Biryani', qty: 1, rate: 300, amount: 300, tax_rate: 5 },
    { name: 'Masala Chai', qty: 3, rate: 40, amount: 120, tax_rate: 5 },
    { name: 'Gulab Jamun', qty: 2, rate: 80, amount: 160, tax_rate: 5 },
  ],
};

const PAYMENT_METHODS = [
  'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Paytm', 'PhonePe',
  'Swiggy Pay', 'Zomato Pay', 'Complimentary', 'House Account',
];

const DISCOUNT_REASONS = ['Happy Hour', 'Staff Meal', 'Manager Comp', 'Coupon', 'Other'];

type PaymentLine = { method: string; amount: number };

export default function Billing() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;
  const { data: restaurant } = useRestaurant(restaurantId);

  const [discountType, setDiscountType] = useState<'pct' | 'flat'>('pct');
  const [discountValue, setDiscountValue] = useState(10);
  const [discountReason, setDiscountReason] = useState('Happy Hour');
  const [billType, setBillType] = useState('standard');
  const [payments, setPayments] = useState<PaymentLine[]>([{ method: 'Cash', amount: 0 }]);
  const [cashTendered, setCashTendered] = useState(0);
  const [settled, setSettled] = useState(false);

  // Modal & Animation States
  const [isUPILive, setIsUPILive] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStage, setPrintStage] = useState<'idle' | 'feeding' | 'ready' | 'torn'>('idle');

  const subtotal = MOCK_ORDER.items.reduce((s, i) => s + i.amount, 0);
  const discountAmount = discountType === 'pct' ? subtotal * discountValue / 100 : discountValue;
  const taxable = subtotal - discountAmount;
  const cgst = taxable * 0.025;
  const sgst = taxable * 0.025;
  const serviceCharge = taxable * 0.05;
  const roundOff = Math.round(taxable + cgst + sgst + serviceCharge) - (taxable + cgst + sgst + serviceCharge);
  const grandTotal = Math.round(taxable + cgst + sgst + serviceCharge + roundOff);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = grandTotal - totalPaid;
  const hasCash = payments.some(p => p.method === 'Cash');
  const changeToReturn = hasCash ? Math.max(0, cashTendered - grandTotal) : 0;

  // Retrieve merchant UPI information from DB settings field
  const restSettings = (restaurant?.settings as any) || {};
  const upiId = restSettings.upi_id || 'merchant@upi';
  const upiName = restSettings.upi_name || restaurant?.name || 'Restaurant POS';

  // Construct merchant UPI URL
  // Format: upi://pay?pa=address&pn=name&am=amount&cu=INR
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${grandTotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const addPayment = () => setPayments(p => [...p, { method: 'UPI', amount: 0 }]);
  const removePayment = (idx: number) => setPayments(p => p.filter((_, i) => i !== idx));
  const updatePayment = (idx: number, field: keyof PaymentLine, value: string | number) => {
    setPayments(p => p.map((pay, i) => i === idx ? { ...pay, [field]: value } : pay));
  };

  const handleSettleClick = () => {
    if (balance > 0) { toast.error('Payment incomplete'); return; }
    
    // Check if UPI payment is present and live modal needs to show
    const hasUPIPayment = payments.some(p => p.method === 'UPI' && p.amount > 0);
    if (hasUPIPayment) {
      setIsUPILive(true);
    } else {
      settle();
    }
  };

  const settle = () => {
    setIsUPILive(false);
    setSettled(true);
    toast.success('Bill settled successfully!');
    setTimeout(() => setSettled(false), 3000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setPrintStage('feeding');

    // Simulate mechanical ticket printing
    setTimeout(() => {
      setPrintStage('ready');
    }, 2000);
  };

  const handleTear = () => {
    setPrintStage('torn');
    setTimeout(() => {
      setIsPrinting(false);
      setPrintStage('idle');
      toast.success('Receipt printed successfully');
    }, 800);
  };

  if (settled) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] -m-4 md:-m-6 bg-background">
        <div className="text-center animate-in zoom-in-50 duration-500">
          <div className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-12 w-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Bill Settled!</h2>
          <p className="text-muted-foreground mt-1">Bill #001 — ₹{grandTotal}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-4 md:-m-6 relative">
      {/* LEFT — Receipt Preview */}
      <div className="w-[45%] bg-muted/30 flex items-start justify-center p-6 overflow-auto">
        <div className="w-[320px] bg-white rounded-lg shadow-lg p-5 font-mono text-xs text-gray-800 border">
          <div className="text-center mb-3">
            <div className="text-base font-bold">🍽️ {restaurant?.name || 'RESTAURANT OS'}</div>
            <div className="text-[10px] text-gray-500">{restaurant?.address_1 || '123 Food Street'}</div>
            {restaurant?.address_2 && <div className="text-[10px] text-gray-500">{restaurant.address_2}</div>}
            <div className="text-[10px] text-gray-500">
              {[restaurant?.city, restaurant?.state, restaurant?.pin].filter(Boolean).join(', ') || 'Connaught Place, New Delhi'}
            </div>
            {restaurant?.phone && <div className="text-[10px] text-gray-500">Ph: {restaurant.phone}</div>}
            {restaurant?.gstin && <div className="text-[10px] text-gray-500">GSTIN: {restaurant.gstin}</div>}
            {restaurant?.fssai && <div className="text-[10px] text-gray-500">FSSAI: {restaurant.fssai}</div>}
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between text-[10px]">
            <span>Bill #: 001</span><span>Date: {MOCK_ORDER.date}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Table: {MOCK_ORDER.table}</span><span>Cashier: {MOCK_ORDER.cashier}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Covers: {MOCK_ORDER.covers}</span><span>Time: {MOCK_ORDER.time}</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between font-bold text-[10px] mb-1">
            <span className="w-[45%]">Item</span>
            <span className="w-[15%] text-center">Qty</span>
            <span className="w-[20%] text-right">Rate</span>
            <span className="w-[20%] text-right">Amt</span>
          </div>
          {MOCK_ORDER.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px]">
                <span className="w-[45%] truncate">{item.name}</span>
                <span className="w-[15%] text-center">{item.qty}</span>
                <span className="w-[20%] text-right">{item.rate}</span>
                <span className="w-[20%] text-right">{item.amount}</span>
              </div>
              {item.variant && <div className="text-[9px] text-gray-400 ml-1">[{item.variant}]</div>}
            </div>
          ))}
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discountValue > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({discountType === 'pct' ? `${discountValue}%` : '₹'}):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between"><span>Taxable:</span><span>₹{taxable.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>CGST @2.5%:</span><span>₹{cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST @2.5%:</span><span>₹{sgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Service Charge 5%:</span><span>₹{serviceCharge.toFixed(2)}</span></div>
            {roundOff !== 0 && (
              <div className="flex justify-between"><span>Round Off:</span><span>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span></div>
            )}
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span><span>₹{grandTotal}</span>
          </div>
          <div className="text-center mt-3 text-[9px] text-gray-400">Thank you! Visit again.</div>
        </div>
      </div>

      {/* RIGHT — Payment Controls */}
      <div className="w-[55%] border-l flex flex-col bg-card">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* Bill Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bill Type</label>
              <Tabs value={billType} onValueChange={setBillType}>
                <TabsList className="h-8">
                  <TabsTrigger value="standard" className="text-xs">Standard GST</TabsTrigger>
                  <TabsTrigger value="simplified" className="text-xs">Simplified</TabsTrigger>
                  <TabsTrigger value="complimentary" className="text-xs">Complimentary</TabsTrigger>
                  <TabsTrigger value="credit" className="text-xs">Credit Note</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Discount */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Discount</label>
              <div className="flex gap-2">
                <Tabs value={discountType} onValueChange={v => setDiscountType(v as 'pct' | 'flat')}>
                  <TabsList className="h-8">
                    <TabsTrigger value="pct" className="text-xs">%</TabsTrigger>
                    <TabsTrigger value="flat" className="text-xs">₹</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))}
                  className="h-8 w-24 text-sm" />
                <Select value={discountReason} onValueChange={setDiscountReason}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Grand Total */}
            <div className="text-center py-2">
              <div className="text-xs text-muted-foreground">Grand Total</div>
              <div className="text-4xl font-bold text-foreground">₹{grandTotal}</div>
            </div>

            <Separator />

            {/* Payments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Payment</label>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={addPayment}>
                  <Plus className="h-3 w-3 mr-1" /> Add Split
                </Button>
              </div>
              <div className="space-y-2">
                {payments.map((pay, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={pay.method} onValueChange={v => updatePayment(idx, 'method', v)}>
                      <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" value={pay.amount || ''} placeholder="Amount"
                      onChange={e => updatePayment(idx, 'amount', Number(e.target.value))}
                      className="h-8 text-sm flex-1" />
                    {payments.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removePayment(idx)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {hasCash && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Cash Tendered</span>
                    <Input type="number" value={cashTendered || ''} onChange={e => setCashTendered(Number(e.target.value))}
                      className="h-7 w-28 text-sm" />
                  </div>
                  {changeToReturn > 0 && (
                    <div className="text-sm font-bold text-success">Change: ₹{changeToReturn}</div>
                  )}
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className={cn("text-lg font-bold", balance > 0 ? "text-destructive" : "text-success")}>
                  {balance > 0 ? `₹${balance} remaining` : balance < 0 ? `₹${Math.abs(balance)} overpaid` : '✓ Paid'}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="border-t p-3 space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 h-9 text-xs" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-9 text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-9 text-xs">
              <Mail className="h-3.5 w-3.5 mr-1" /> Email
            </Button>
            <Button size="sm" variant="ghost" className="h-9 text-xs">
              <X className="h-3.5 w-3.5 mr-1" /> Skip
            </Button>
          </div>
          <Button className="w-full h-11 text-sm font-bold" onClick={handleSettleClick}
            disabled={balance > 0}>
            <Check className="h-4 w-4 mr-2" /> Settle Bill — ₹{grandTotal}
          </Button>
        </div>
      </div>

      {/* ════════════ UPI QR CODE DIALOG ════════════ */}
      <Dialog open={isUPILive} onOpenChange={setIsUPILive}>
        <DialogContent className="max-w-xs text-center p-6">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Scan & Pay</DialogTitle>
            <DialogDescription className="text-center">
              Scan this dynamic QR code using any UPI app to complete the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="p-2 border-2 border-primary/20 rounded-xl bg-white shadow-inner">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-[180px] h-[180px]" />
            </div>
            <div className="text-xl font-black text-foreground mt-3">₹{grandTotal}</div>
            <div className="text-xs text-muted-foreground mt-1">Merchant: <b className="text-foreground">{upiName}</b></div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{upiId}</div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" onClick={settle}>
              <Check className="mr-2 h-4 w-4" /> Confirm Payment Received
            </Button>
            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setIsUPILive(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════ THERMAL RECEIPT PRINT ANIMATION OVERLAY ════════════ */}
      {isPrinting && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-[340px] max-h-[85vh] flex flex-col items-center">
            
            {/* 3D Printer Head Box */}
            <div className={cn(
              "w-[240px] h-[70px] bg-gradient-to-b from-gray-800 to-gray-950 rounded-t-2xl border border-gray-700 shadow-2xl relative flex flex-col items-center justify-center z-20 transition-all",
              printStage === 'feeding' && "animate-[wiggle_0.15s_infinite]"
            )}>
              {/* Paper slit line */}
              <div className="w-[200px] h-[5px] bg-black rounded shadow-inner relative overflow-hidden">
                {printStage === 'feeding' && (
                  <div className="h-full bg-emerald-500 animate-pulse w-full" />
                )}
              </div>
              <div className="text-[9px] font-bold text-gray-500 mt-2 tracking-widest font-mono">
                {printStage === 'feeding' ? 'PRINTING RECEIPT...' : 'PRINT COMPLETED'}
              </div>
            </div>

            {/* Receipt Paper Sliding Down */}
            <div className={cn(
              "w-[220px] bg-white text-gray-800 p-4 font-mono text-[9px] shadow-2xl border-x border-gray-100 z-10 transition-all duration-[2000ms] ease-out origin-top",
              printStage === 'feeding' ? "scale-y-0 opacity-0 max-h-0" : "scale-y-100 opacity-100 max-h-[450px]",
              printStage === 'torn' && "translate-y-[20px] rotate-2 opacity-0 duration-700 ease-in"
            )}>
              <div className="text-center font-bold text-xs">🍽️ {restaurant?.name || 'RESTAURANT OS'}</div>
              <div className="text-[8px] text-center text-gray-500">{restaurant?.address_1 || '123 Food Street'}</div>
              <div className="border-t border-dashed border-gray-300 my-1" />
              <div className="space-y-0.5">
                <div className="flex justify-between"><span>Bill #: 001</span><span>Date: 09 Apr 26</span></div>
                <div className="flex justify-between"><span>Table: T5</span><span>Covers: 3</span></div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-1" />
              {MOCK_ORDER.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <span>{item.qty} x ₹{item.rate}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 my-1" />
              <div className="space-y-0.5 text-right font-bold text-xs">
                <div>TOTAL: ₹{grandTotal}</div>
              </div>
              <div className="text-center text-[7px] text-gray-400 mt-3">--- Customer Copy ---</div>
            </div>

            {/* Tear Action Panel */}
            {printStage === 'ready' && (
              <div className="mt-4 z-30 animate-bounce">
                <Button size="sm" className="bg-destructive text-destructive-foreground font-bold text-xs shadow-lg hover:bg-destructive/90" onClick={handleTear}>
                  ✂️ Tear Receipt Bill
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS for custom printing wiggle animation */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(0.4deg) translateY(-0.3px); }
          75% { transform: rotate(-0.4deg) translateY(0.3px); }
        }
      `}</style>
    </div>
  );
}
