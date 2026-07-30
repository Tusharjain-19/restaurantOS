import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Minus, Plus, Trash2, Send, Pause, FileText, X, Users, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFloors, useTables, useMenuCategories, useMenuItems, useRestaurant } from '@/hooks/useRestaurantData';
import {
  type MockMenuItem, type OrderItem,
} from '@/lib/mock-data';
import { db } from '@/lib/db';
import { ThermalReceipt } from '@/components/pos/ThermalReceipt';

type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export default function POS() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;

  const { data: floors = [] } = useFloors(restaurantId);
  const { data: tables = [] } = useTables(restaurantId);
  const { data: categories = [] } = useMenuCategories(restaurantId);
  const { data: menuItems = [] } = useMenuItems(restaurantId);

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [guestCount, setGuestCount] = useState(2);
  const [variantItem, setVariantItem] = useState<MockMenuItem | null>(null);
  const [specialInstr, setSpecialInstr] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tokenNumber] = useState(Math.floor(Math.random() * 900) + 100);

  const [showPayment, setShowPayment] = useState(false);
  const [printingBill, setPrintingBill] = useState<any>(null);
  const [showUpiQr, setShowUpiQr] = useState(false);

  const { data: restaurant } = useRestaurant(restaurantId);

  // Set default selection when data finishes loading
  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors, selectedFloor]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const floorTables = tables.filter(t => t.floor_id === selectedFloor)
    .filter(t => !tableSearch || t.number.toLowerCase().includes(tableSearch.toLowerCase()));

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      return menuItems.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return menuItems.filter(i => i.category_id === selectedCategory);
  }, [searchQuery, selectedCategory, menuItems]);

  const addItem = useCallback((item: MockMenuItem, variantId?: string, variantName?: string, instructions?: string) => {
    const variant = item.variants?.find(v => v.id === variantId);
    const price = variant ? item.price + variant.price_modifier : item.price;

    setOrderItems(prev => {
      const existing = prev.find(o =>
        o.item_id === item.id && o.variant_id === variantId && !o.special_instructions
      );
      if (existing && !instructions) {
        return prev.map(o => o.id === existing.id ? { ...o, qty: o.qty + 1 } : o);
      }
      return [...prev, {
        id: crypto.randomUUID(),
        item_id: item.id,
        variant_id: variantId,
        name: item.name,
        variant_name: variantName || variant?.name,
        qty: 1,
        unit_price: price,
        special_instructions: instructions,
        kot_status: 'pending' as const,
        is_addon: prev.some(o => o.kot_status === 'sent'),
      }];
    });
  }, []);

  const updateQty = (id: string, delta: number) => {
    setOrderItems(prev => prev.map(o =>
      o.id === id ? { ...o, qty: Math.max(1, o.qty + delta) } : o
    ));
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(o => o.id !== id));
  };

  const subtotal = orderItems.reduce((s, o) => s + o.qty * o.unit_price, 0);
  const taxRate = 0.05;
  const cgst = subtotal * taxRate / 2;
  const sgst = subtotal * taxRate / 2;
  const total = subtotal + cgst + sgst;

  const sendKOT = () => {
    setOrderItems(prev => prev.map(o =>
      o.kot_status === 'pending' ? { ...o, kot_status: 'sent' as const } : o
    ));
    toast.success('KOT sent to kitchen');
  };

  const handleBillAndPay = async (paymentMethod: string) => {
    const selectedTableData = tables.find(t => t.id === selectedTable);
    
    // Generate simple incremental order and bill numbers
    const billCount = (await db.bills.count()) + 1;
    const orderCount = (await db.orders.count()) + 1;
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `ORD${dateStr}${String(orderCount).padStart(3, '0')}`;
    const billNumber = `BL${dateStr}${String(billCount).padStart(3, '0')}`;

    const orderId = crypto.randomUUID();

    // Create order in Dexie
    await db.orders.add({
      id: orderId,
      restaurant_id: restaurantId || 'guest-restaurant-id',
      order_number: orderNumber,
      order_type: orderType,
      table_id: selectedTable || undefined,
      table_number: selectedTableData?.number,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      status: 'paid',
      subtotal,
      discount_amount: 0,
      tax_amount: cgst + sgst,
      total,
      payment_method: paymentMethod,
      payment_status: 'paid',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create bill in Dexie
    const newBillData: any = {
      id: crypto.randomUUID(),
      restaurant_id: restaurantId || 'guest-restaurant-id',
      bill_number: billNumber,
      order_id: orderId,
      table_number: selectedTableData?.number,
      order_type: orderType,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: orderItems.map(i => ({
        name: i.name,
        variant: i.variant_name,
        quantity: i.qty,
        rate: i.unit_price,
        amount: i.qty * i.unit_price,
        tax_rate: 5,
        special_instructions: i.special_instructions
      })),
      subtotal,
      discount_amount: 0,
      cgst,
      sgst,
      igst: 0,
      service_charge: 0,
      packaging_charge: 0,
      delivery_charge: 0,
      round_off: 0,
      grand_total: Math.round(total),
      payment_method: paymentMethod,
      status: 'paid',
      created_at: new Date(),
      paid_at: new Date(),
    };
    await db.bills.add(newBillData);

    // Reset table in Dexie
    if (selectedTable) {
      await db.restaurantTables.update(selectedTable, { status: 'available' });
    }

    // Clear state
    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    setShowPayment(false);

    setPrintingBill(newBillData);
    toast.success(`Bill ${billNumber} saved to History & Printing...`, {
      description: `Amount: ₹${Math.round(total)} paid via ${paymentMethod}`,
      duration: 5000
    });
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);

  const upiId = (restaurant?.settings as any)?.upi_id || 'merchant@upi';
  const upiName = restaurant?.name || 'Restaurant OS';
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${Math.round(total)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey) {
        e.preventDefault();
        document.getElementById('pos-search')?.focus();
      }
      if (e.key === 'Escape') setSearchQuery('');
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); sendKOT(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [orderItems]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-4 md:-m-6">
      {/* LEFT PANEL — Table/Order Selection */}
      <div className="w-[28%] min-w-[240px] border-r bg-card flex flex-col">
        <Tabs value={orderType} onValueChange={v => setOrderType(v as OrderType)} className="p-2">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="dine_in" className="text-xs">Dine-In</TabsTrigger>
            <TabsTrigger value="takeaway" className="text-xs">Takeaway</TabsTrigger>
            <TabsTrigger value="delivery" className="text-xs">Delivery</TabsTrigger>
          </TabsList>
        </Tabs>

        {orderType === 'dine_in' && (
          <>
            <div className="flex gap-1 px-2 overflow-x-auto">
              {floors.map(f => (
                <button key={f.id} onClick={() => setSelectedFloor(f.id)}
                  className={cn("text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors",
                    selectedFloor === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}>
                  {f.name}
                </button>
              ))}
            </div>
            <div className="px-2 pt-2">
              <Input placeholder="Search table..." value={tableSearch} onChange={e => setTableSearch(e.target.value)}
                className="h-8 text-xs" />
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="grid grid-cols-3 gap-1.5">
                {floorTables.map(table => (
                  <button key={table.id} onClick={() => setSelectedTable(table.id)}
                    className={cn(
                      "rounded-lg p-2 text-center border-2 transition-all text-xs",
                      table.status === 'available' && "bg-success/10 border-success/30 hover:border-success",
                      table.status === 'occupied' && "bg-destructive/10 border-destructive/30 hover:border-destructive",
                      table.status === 'reserved' && "bg-warning/10 border-warning/30",
                      table.status === 'dirty' && "bg-muted border-muted-foreground/20",
                      selectedTable === table.id && "ring-2 ring-primary",
                    )}>
                    <div className="font-bold text-foreground">{table.number}</div>
                    <div className="text-[10px] text-muted-foreground">{table.capacity} seats</div>
                    {table.status === 'occupied' && (
                      <div className="text-[10px] font-medium text-destructive">₹{table.order_amount} • {table.order_time}</div>
                    )}
                    {table.status === 'reserved' && (
                      <div className="text-[10px] text-warning">{table.reservation_name}</div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {orderType === 'takeaway' && (
          <div className="p-3 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">Token Number</div>
              <div className="text-3xl font-bold text-primary">{tokenNumber}</div>
            </div>
            <Input placeholder="Customer Name (optional)" value={customerName}
              onChange={e => setCustomerName(e.target.value)} className="h-9 text-sm" />
            <Input placeholder="Phone (optional)" value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)} className="h-9 text-sm" />
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="p-3 space-y-3">
            <Input placeholder="Customer Name *" value={customerName}
              onChange={e => setCustomerName(e.target.value)} className="h-9 text-sm" />
            <Input placeholder="Phone *" value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)} className="h-9 text-sm" />
            <Textarea placeholder="Delivery Address *" className="text-sm min-h-[60px]" />
            <Input type="time" className="h-9 text-sm" />
          </div>
        )}
      </div>

      {/* CENTER PANEL — Menu */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        <div className="p-2 flex gap-2 items-center border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input id="pos-search" placeholder="Search menu... ( / )" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {!searchQuery && (
          <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b">
            {categories.map(c => {
              const count = menuItems.filter(i => i.category_id === c.id).length;
              return (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                  className={cn("text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5",
                    selectedCategory === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}>
                  {c.name}
                  <span className={cn("text-[10px] rounded-full px-1.5 py-0.5",
                    selectedCategory === c.id ? "bg-primary-foreground/20" : "bg-background"
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-3 gap-2 p-2">
            {filteredItems.map(item => (
              <button key={item.id} disabled={!item.is_available}
                onClick={() => {
                  if (item.variants?.length) {
                    setVariantItem(item);
                    setSpecialInstr('');
                  } else {
                    addItem(item);
                  }
                }}
                className={cn(
                  "rounded-lg border p-2.5 text-left transition-all hover:shadow-md relative group",
                  !item.is_available && "opacity-40 cursor-not-allowed",
                  item.is_available && "hover:border-primary/50 active:scale-[0.98]",
                )}>
                <div className="flex items-center justify-between mb-1">
                  <div className={cn("h-3 w-3 rounded-sm border-2",
                    item.item_type === 'veg' && "border-green-600 bg-green-600",
                    item.item_type === 'non-veg' && "border-red-600 bg-red-600",
                    item.item_type === 'egg' && "border-amber-500 bg-amber-500",
                  )} />
                  {!item.is_available && (
                    <Badge variant="destructive" className="text-[9px] h-4">Out of Stock</Badge>
                  )}
                </div>
                <div className="font-medium text-xs text-foreground line-clamp-2 leading-tight mb-1">{item.name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">₹{item.price}</span>
                  {item.variants && (
                    <Badge variant="outline" className="text-[9px] h-4">Variants</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT PANEL — Current Order */}
      <div className="w-[30%] min-w-[260px] border-l bg-card flex flex-col">
        <div className="p-2.5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                {orderType === 'dine_in' && selectedTableData ? `${selectedTableData.number} — Dine In` :
                 orderType === 'takeaway' ? `Token #${tokenNumber}` : 'Delivery Order'}
              </span>
            </div>
            {orderType === 'dine_in' && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <Input type="number" min={1} value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="h-7 w-12 text-xs text-center" />
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {orderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCartEmpty />
              <span className="text-xs mt-2">No items added yet</span>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {orderItems.map(item => (
                <div key={item.id} className={cn(
                  "rounded-lg border p-2 text-xs",
                  item.is_addon && "border-l-4 border-l-accent",
                )}>
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{item.name}</div>
                      {item.variant_name && (
                        <span className="text-[10px] text-muted-foreground">[{item.variant_name}]</span>
                      )}
                      {item.special_instructions && (
                        <div className="text-[10px] text-muted-foreground italic mt-0.5">⚠ {item.special_instructions}</div>
                      )}
                    </div>
                    <KotBadge status={item.kot_status} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-foreground">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{item.qty * item.unit_price}</span>
                      <button onClick={() => removeItem(item.id)}
                        className="h-6 w-6 rounded flex items-center justify-center text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {orderItems.length > 0 && (
          <div className="border-t p-2.5 space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>CGST @2.5%</span><span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>SGST @2.5%</span><span>₹{sgst.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm text-foreground">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button size="sm" className="h-9 text-xs" onClick={sendKOT}
                disabled={!orderItems.some(o => o.kot_status === 'pending')}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send KOT
              </Button>
              <Button size="sm" variant="outline" className="h-9 text-xs"
                onClick={() => toast.success('Order held')}>
                <Pause className="h-3.5 w-3.5 mr-1" /> Hold
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-9 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowPayment(true)}
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Bill
              </Button>
              <Button size="sm" variant="ghost" className="h-9 text-xs text-destructive"
                onClick={() => setClearConfirm(true)}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Variant Drawer */}
      <Drawer open={!!variantItem} onOpenChange={o => !o && setVariantItem(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{variantItem?.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <div className="text-sm font-medium mb-2 text-foreground">Select Variant</div>
            <div className="flex flex-wrap gap-2">
              {variantItem?.variants?.map(v => (
                <button key={v.id}
                  onClick={() => {
                    addItem(variantItem, v.id, v.name, specialInstr || undefined);
                    setVariantItem(null);
                  }}
                  className="px-4 py-2 rounded-full border-2 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors">
                  {v.name} — ₹{variantItem.price + v.price_modifier}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Textarea placeholder="Special instructions (e.g. No onion, less spicy)"
                value={specialInstr} onChange={e => setSpecialInstr(e.target.value)}
                className="text-sm min-h-[50px]" />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Clear Confirmation */}
      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Order?</AlertDialogTitle>
            <AlertDialogDescription>This will remove all items from the current order.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setOrderItems([]); setClearConfirm(false); }}>
              Clear Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className={showUpiQr ? "max-w-sm" : ""}>
          <DialogHeader>
            <DialogTitle>{showUpiQr ? 'Scan to Pay' : 'Select Payment Method'}</DialogTitle>
          </DialogHeader>
          {showUpiQr ? (
            <div className="flex flex-col items-center justify-center space-y-5 py-2">
              <div className="bg-white p-3 rounded-xl shadow-sm border">
                <img src={qrCodeUrl} alt="UPI QR Code" className="w-[180px] h-[180px]" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">₹{Math.round(total)}</p>
                <p className="text-sm text-muted-foreground mt-1">Scan using any UPI App</p>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block mt-2">{upiId}</p>
              </div>
              <div className="flex w-full gap-3 pt-4 border-t mt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpiQr(false)}>Cancel</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 font-bold" onClick={() => {
                   setShowUpiQr(false);
                   handleBillAndPay('UPI');
                }}>Confirm Payment</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center p-4 rounded-lg bg-primary/5 border">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-foreground">₹{Math.round(total)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-14 gap-2" onClick={() => handleBillAndPay('Cash')}>
                  <Banknote className="h-4 w-4" /> Cash
                </Button>
                <Button variant="outline" className="h-14 gap-2" onClick={() => {
                    const profileSettings = (restaurant?.settings as any) || {};
                    if (profileSettings.upi_id) setShowUpiQr(true);
                    else handleBillAndPay('UPI');
                }}>
                  <Smartphone className="h-4 w-4" /> UPI
                </Button>
                <Button variant="outline" className="h-14 gap-2" onClick={() => handleBillAndPay('Card')}>
                  <CreditCard className="h-4 w-4" /> Card
                </Button>
                <Button variant="outline" className="h-14 gap-2" onClick={() => handleBillAndPay('Wallet')}>
                  <Wallet className="h-4 w-4" /> Wallet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Printable Receipt Overlay */}
      <ThermalReceipt 
        bill={printingBill} 
        restaurant={restaurant} 
        onClose={() => setPrintingBill(null)} 
      />
    </div>
  );
}

function ShoppingCartEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}

function KotBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    sent: 'bg-accent/20 text-accent',
    in_prep: 'bg-warning/20 text-warning',
    ready: 'bg-success/20 text-success',
    served: 'bg-primary/20 text-primary',
  };
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", styles[status] || styles.pending)}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}
