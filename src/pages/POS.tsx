import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Minus, Plus, Trash2, Send, Pause, FileText, X, Users, Percent, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { db, getNextSequence, type MenuItem, type TableConfig, type Bill } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ThermalReceipt } from '@/components/pos/ThermalReceipt';
import QRCode from 'react-qr-code';

type OrderType = 'dine_in' | 'takeaway' | 'delivery';

interface CartItem {
  id: string;
  item_id: number;
  variant_id?: string;
  name: string;
  variant_name?: string;
  qty: number;
  unit_price: number;
  special_instructions?: string;
  kot_status: 'pending' | 'sent' | 'in_prep' | 'ready' | 'served';
  is_addon: boolean;
}

export default function POS() {
  const floors = useLiveQuery(() => db.floors.orderBy('display_order').toArray()) || [];
  const allTables = useLiveQuery(() => db.restaurantTables.toArray()) || [];
  const categories = useLiveQuery(() => db.menuCategories.orderBy('display_order').toArray()) || [];
  const menuItems = useLiveQuery(() => db.menuItems.toArray()) || [];
  const paymentMethods = useLiveQuery(() => db.paymentMethods.orderBy('display_order').filter(p => p.is_active).toArray()) || [];

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [tableCarts, setTableCarts] = useState<Record<number, CartItem[]>>(() => {
    const saved = localStorage.getItem('pos_table_carts');
    return saved ? JSON.parse(saved) : {};
  });
  const [takeawayItems, setTakeawayItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_takeaway_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [deliveryItems, setDeliveryItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_delivery_items');
    return saved ? JSON.parse(saved) : [];
  });

  const handleTableClick = (tableId: number) => {
    if (selectedTable === tableId) return;
    
    // Save current items to appropriate draft
    if (orderType === 'dine_in' && selectedTable) {
      setTableCarts(prev => ({ ...prev, [selectedTable]: orderItems }));
    } else if (orderType === 'takeaway') {
      setTakeawayItems(orderItems);
    } else if (orderType === 'delivery') {
      setDeliveryItems(orderItems);
    }

    // Force Dine-In type when clicking a table
    if (orderType !== 'dine_in') setOrderType('dine_in');
    
    setSelectedTable(tableId);
    setOrderItems(tableCarts[tableId] || []);
  };
  const [guestCount, setGuestCount] = useState(2);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [variantItem, setVariantItem] = useState<MenuItem | null>(null);
  const [specialInstr, setSpecialInstr] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tokenNumber, setTokenNumber] = useState<number>(0);
  const [heldOrders, setHeldOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('pos_held_orders');
    return saved ? JSON.parse(saved).map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })) : [];
  });
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [printingBill, setPrintingBill] = useState<Bill | null>(null);
  const [showUpiQr, setShowUpiQr] = useState<boolean>(false);
  const restaurantProfile = useLiveQuery(() => db.restaurant.toCollection().first());

  useEffect(() => {
    localStorage.setItem('pos_table_carts', JSON.stringify(tableCarts));
  }, [tableCarts]);

  useEffect(() => {
    localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    localStorage.setItem('pos_takeaway_items', JSON.stringify(takeawayItems));
  }, [takeawayItems]);

  useEffect(() => {
    localStorage.setItem('pos_delivery_items', JSON.stringify(deliveryItems));
  }, [deliveryItems]);

  useEffect(() => {
    if (selectedTable) {
      setTableCarts(prev => {
        if (JSON.stringify(prev[selectedTable]) === JSON.stringify(orderItems)) return prev;
        return { ...prev, [selectedTable]: orderItems };
      });
    } else if (orderType === 'takeaway') {
      setTakeawayItems(orderItems);
    } else if (orderType === 'delivery') {
      setDeliveryItems(orderItems);
    }
  }, [orderItems, selectedTable, orderType]);

  // Init selected floor
  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) setSelectedFloor(floors[0].id!);
  }, [floors]);

  const loadToken = async () => {
    const res = await getNextSequence('token');
    setTokenNumber(res.count);
  };

  useEffect(() => {
    loadToken();
  }, []);

  // Init selected category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0].id!);
  }, [categories]);

  const floorTables = allTables
    .filter(t => t.floor_id === selectedFloor)
    .filter(t => !tableSearch || t.number.toLowerCase().includes(tableSearch.toLowerCase()));

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      return menuItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) && !i.is_hidden);
    }
    return menuItems.filter(i => i.category_id === selectedCategory && !i.is_hidden);
  }, [searchQuery, selectedCategory, menuItems]);

  const addItem = useCallback((item: MenuItem, variantId?: string, variantName?: string, instructions?: string, addonPrice: number = 0) => {
    const variant = item.variants?.find(v => v.id === variantId);
    const price = (variant ? item.price + variant.price_modifier : item.price) + addonPrice;

    setOrderItems(prev => {
      const existing = prev.find(o =>
        o.item_id === item.id! && o.variant_id === variantId && o.special_instructions === instructions
      );
      if (existing) {
        return prev.map(o => o.id === existing.id ? { ...o, qty: o.qty + 1 } : o);
      }
      return [...prev, {
        id: crypto.randomUUID(),
        item_id: item.id!,
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

  const SGST_RATE = 0.025;
  const CGST_RATE = 0.025;

  const subtotal = orderItems.reduce((s, o) => s + o.qty * o.unit_price, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const taxableAmount = subtotal - discountAmount;
  const cgst = taxableAmount * CGST_RATE;
  const sgst = taxableAmount * SGST_RATE;
  const total = taxableAmount + cgst + sgst;

  const sendKOT = async () => {
    const kotSeq = await getNextSequence('kot');
    const kotNumber = kotSeq.count;
    
    const pendingItems = orderItems.filter(o => o.kot_status === 'pending');
    if (pendingItems.length === 0) return;

    const selectedTableData = allTables.find(t => t.id === selectedTable);

    await db.kots.add({
      kot_number: kotNumber,
      order_id: 0,
      table_number: selectedTableData?.number || (orderType === 'takeaway' ? `TKW-${tokenNumber}` : `DEL`),
      order_type: orderType === 'dine_in' ? 'Dine-In' : orderType === 'takeaway' ? 'Takeaway' : 'Delivery',
      status: 'received',
      items: pendingItems.map(i => ({
        name: i.name,
        quantity: i.qty,
        variant: i.variant_name,
        item_type: menuItems.find(mi => mi.id === i.item_id)?.item_type || 'veg',
        special_instructions: i.special_instructions,
      })),
      created_at: new Date(),
      updated_at: new Date(),
    });

    setOrderItems(prev => prev.map(o =>
      o.kot_status === 'pending' ? { ...o, kot_status: 'sent' as const } : o
    ));

    if (selectedTable) {
      await db.restaurantTables.update(selectedTable, { status: 'occupied' });
    }

    toast.success(`KOT #${kotNumber} sent to kitchen`);
  };

  const handleBillAndPay = async (paymentMethod: string) => {
    const selectedTableData = allTables.find(t => t.id === selectedTable);
    
    // Generate Continuous IDs directly from DB sequence
    const ordersSeq = await getNextSequence('order');
    const billsSeq = await getNextSequence('bill');

    const orderNumber = `ORD${ordersSeq.dateStr}${String(ordersSeq.count).padStart(3, '0')}`;
    const billNumber = `BL${billsSeq.dateStr}${String(billsSeq.count).padStart(3, '0')}`;

    // Create order
    const orderId = await db.orders.add({
      order_number: orderNumber,
      order_type: orderType,
      table_id: selectedTable || undefined,
      table_number: selectedTableData?.number,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      delivery_address: deliveryAddress || undefined,
      guest_count: guestCount,
      status: 'paid',
      subtotal,
      discount_amount: discountAmount,
      discount_type: discountType,
      tax_amount: cgst + sgst,
      service_charge: 0,
      packaging_charge: 0,
      delivery_charge: 0,
      total,
      payment_method: paymentMethod,
      payment_status: 'paid',
      kot_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
      paid_at: new Date(),
    });

    // Create bill
    const newBillData: any = {
      bill_number: billNumber,
      order_id: orderId as number,
      table_number: selectedTableData?.number,
      order_type: orderType,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: orderItems.map(i => ({
        name: i.name, variant: i.variant_name, quantity: i.qty,
        rate: i.unit_price, amount: i.qty * i.unit_price, tax_rate: 5,
        special_instructions: i.special_instructions
      })),
      subtotal,
      discount_amount: discountAmount,
      cgst, sgst, igst: 0,
      service_charge: 0, packaging_charge: 0, delivery_charge: 0,
      round_off: 0,
      grand_total: Math.round(total),
      payment_method: paymentMethod,
      status: 'paid',
      created_at: new Date(),
      paid_at: new Date(),
    };
    await db.bills.add(newBillData);

    // Reset table
    if (selectedTable) {
      await db.restaurantTables.update(selectedTable, { status: 'available' });
    }

    // Clear order
    setOrderItems([]);
    setSelectedTable(null);
    if (selectedTable) {
      setTableCarts(prev => {
        const next = { ...prev };
        delete next[selectedTable];
        return next;
      });
    } else if (orderType === 'takeaway') {
      setTakeawayItems([]);
    } else if (orderType === 'delivery') {
      setDeliveryItems([]);
    }

    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDiscount(0);
    setShowPayment(false);

    setPrintingBill(newBillData as Bill);
    toast.success(`Bill ${billNumber} saved to History & Printing...`, {
      description: `Amount: ₹${Math.round(total)} paid via ${paymentMethod}`,
      duration: 5000
    });
    
    // Load fresh token for next order
    loadToken();
  };

  const selectedTableData = allTables.find(t => t.id === selectedTable);

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
        <Tabs value={orderType} onValueChange={v => {
          const nextType = v as OrderType;
          if (nextType === orderType) return;

          // Save current state
          if (orderType === 'dine_in' && selectedTable) {
            setTableCarts(prev => ({ ...prev, [selectedTable]: orderItems }));
          } else if (orderType === 'takeaway') {
            setTakeawayItems(orderItems);
          } else if (orderType === 'delivery') {
            setDeliveryItems(orderItems);
          }

          // Load new state
          if (nextType === 'dine_in') {
            // Wait for a table to be selected, or just clear
            setOrderItems([]);
            setSelectedTable(null);
          } else if (nextType === 'takeaway') {
            setSelectedTable(null);
            setOrderItems(takeawayItems);
          } else if (nextType === 'delivery') {
            setSelectedTable(null);
            setOrderItems(deliveryItems);
          }
          
          setOrderType(nextType);
        }} className="p-2">
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
                <button key={f.id} onClick={() => setSelectedFloor(f.id!)}
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
                  <button key={table.id} onClick={() => handleTableClick(table.id!)}
                    className={cn(
                      "rounded-lg p-2 text-center border-2 transition-all text-xs",
                      table.status === 'available' && "bg-success/10 border-success/30 hover:border-success",
                      table.status === 'occupied' && "bg-destructive/10 border-destructive/30 hover:border-destructive",
                      table.status === 'reserved' && "bg-warning/10 border-warning/30",
                      table.status === 'dirty' && "bg-muted border-muted-foreground/20",
                      table.status === 'blocked' && "bg-muted border-muted-foreground/20 opacity-50",
                      selectedTable === table.id && "ring-2 ring-primary",
                    )}>
                    <div className="font-bold text-foreground">{table.number}</div>
                    <div className="text-[10px] text-muted-foreground">{table.capacity} seats</div>
                    <div className={cn("text-[10px] capitalize font-medium",
                      table.status === 'available' && "text-success",
                      table.status === 'occupied' && "text-destructive",
                      table.status === 'reserved' && "text-warning",
                    )}>{table.status}</div>
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
            <Textarea placeholder="Delivery Address *" value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)} className="text-sm min-h-[60px]" />
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
            {categories.map(c => (
              <button key={c.id} onClick={() => setSelectedCategory(c.id!)}
                className={cn("text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5",
                  selectedCategory === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}>
                {c.name}
                <span className={cn("text-[10px] rounded-full px-1.5 py-0.5",
                  selectedCategory === c.id ? "bg-primary-foreground/20" : "bg-background"
                )}>{c.item_count}</span>
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-3 gap-2 p-2">
            {filteredItems.map(item => (
              <button key={item.id} disabled={!item.is_available}
                onClick={() => {
                  if (item.variants?.length || item.addons?.length) {
                    setVariantItem(item);
                    setSelectedVariant(item.variants?.[0] || null);
                    setSelectedAddons([]);
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
                    item.item_type === 'vegan' && "border-emerald-600 bg-emerald-600",
                  )} />
                  {!item.is_available && (
                    <Badge variant="destructive" className="text-[9px] h-4">Out of Stock</Badge>
                  )}
                </div>
                <div className="font-medium text-xs text-foreground line-clamp-2 leading-tight mb-1">{item.name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">₹{item.price}</span>
                  {(item.variants?.length || item.addons?.length) ? (
                    <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20">Customise</Badge>
                  ) : null}
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
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              {orderType === 'dine_in' && selectedTableData ? `${selectedTableData.number} — Dine In` :
               orderType === 'takeaway' ? `Token #${tokenNumber}` : 'Delivery Order'}
              {heldOrders.length > 0 && (
                 <Badge variant="secondary" className="cursor-pointer bg-amber-500/20 text-amber-600 hover:bg-amber-500/30" onClick={() => setIsHeldOrdersOpen(true)}>
                    {heldOrders.length} Held
                 </Badge>
              )}
            </span>
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
                      {item.variant_name && <span className="text-[10px] text-muted-foreground">[{item.variant_name}]</span>}
                      {item.special_instructions && <div className="text-[10px] text-muted-foreground italic mt-0.5">⚠ {item.special_instructions}</div>}
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
            {/* Discount row */}
            <div className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              <Input type="number" min={0} value={discount || ''} onChange={e => setDiscount(Number(e.target.value))}
                placeholder="Discount" className="h-7 text-xs flex-1" />
              <select value={discountType} onChange={e => setDiscountType(e.target.value as any)}
                className="h-7 text-xs rounded border bg-card px-1">
                <option value="percentage">%</option>
                <option value="flat">₹</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>CGST @2.5%</span><span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>SGST @2.5%</span><span>₹{sgst.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm text-foreground">
                <span>Total</span><span>₹{Math.round(total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button size="sm" className="h-9 text-xs" onClick={sendKOT}
                disabled={!orderItems.some(o => o.kot_status === 'pending')}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send KOT
              </Button>
              <Button size="sm" variant="outline" className="h-9 text-xs"
                onClick={() => {
                  if (orderItems.length === 0) return;
                  setHeldOrders(prev => [...prev, {
                    id: crypto.randomUUID(), orderType, tokenNumber, selectedTable,
                    customerName, customerPhone, deliveryAddress, orderItems, timestamp: new Date()
                  }]);
                  setOrderItems([]);
                  setCustomerName(''); setCustomerPhone(''); setDeliveryAddress('');
                  if (orderType === 'takeaway') loadToken();
                  if (selectedTable) {
                    setTableCarts(prev => { const next = {...prev}; delete next[selectedTable]; return next; });
                    setSelectedTable(null);
                  }
                  toast.success('Order placed on Hold');
                }}>
                <Pause className="h-3.5 w-3.5 mr-1" /> Hold
              </Button>
              <Button size="sm" variant="secondary" className="h-9 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowPayment(true)}>
                <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay & Bill
              </Button>
              <Button size="sm" variant="ghost" className="h-9 text-xs text-destructive"
                onClick={() => setClearConfirm(true)}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customisation Drawer */}
      <Drawer open={!!variantItem} onOpenChange={o => !o && setVariantItem(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{variantItem?.name}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-5 pb-2">
            {variantItem?.variants && variantItem.variants.length > 0 && (
              <div className="mb-5">
                <div className="text-sm font-bold mb-2 text-foreground">Select Size / Variant</div>
                <div className="flex flex-wrap gap-2">
                  {variantItem.variants.map(v => (
                    <button key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn("px-4 py-2 rounded-full border-2 text-sm font-bold transition-all",
                         selectedVariant?.id === v.id ? "border-primary bg-primary text-primary-foreground shadow-md" : "hover:border-primary/50 text-muted-foreground"
                      )}>
                      {v.name} <span className="opacity-80 font-normal ml-1">(₹{variantItem.price + v.price_modifier})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variantItem?.addons && variantItem.addons.length > 0 && (
              <div className="mb-5">
                <div className="text-sm font-bold mb-2 text-foreground">Customization / Add-ons</div>
                <div className="grid grid-cols-2 gap-2">
                  {variantItem.addons.map(addon => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                        <div key={addon.id} 
                           onClick={() => {
                               if (isSelected) setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                               else setSelectedAddons(prev => [...prev, addon]);
                           }}
                           className={cn("flex flex-col items-center justify-center text-center p-3 border-2 rounded-xl cursor-pointer transition-all",
                               isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "hover:border-primary/40 border-muted"
                           )}>
                           <div className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>{addon.name}</div>
                           <div className="text-xs font-semibold text-muted-foreground">+₹{addon.price}</div>
                        </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3">
              <div className="text-sm font-bold mb-2 text-foreground">Special Instructions</div>
              <Textarea placeholder="e.g. No onion, less spicy, extra hot"
                value={specialInstr} onChange={e => setSpecialInstr(e.target.value)}
                className="text-sm border-2 rounded-xl min-h-[50px] shadow-sm resize-none focus-visible:ring-1 focus-visible:ring-primary" />
            </div>
          </ScrollArea>
          <DrawerFooter className="pt-2 pb-6 px-5 flex-row gap-3 border-t">
              <Button className="flex-1 font-bold text-md h-12 rounded-xl" onClick={() => {
                  let instr = specialInstr.trim();
                  if (selectedAddons.length > 0) {
                      const addonText = selectedAddons.map(a => `${a.name} (+₹${a.price})`).join(', ');
                      instr = (instr ? `${instr} | ` : '') + `${addonText}`;
                  }
                  
                  const addonTotal = selectedAddons.reduce((acc: number, a: any) => acc + a.price, 0);
                  addItem(variantItem!, selectedVariant?.id, selectedVariant?.name, instr || undefined, addonTotal);
                  setVariantItem(null);
              }}>
                Add to Order &nbsp;•&nbsp; ₹{variantItem ? variantItem.price + (selectedVariant?.price_modifier || 0) + selectedAddons.reduce((acc: number, a: any) => acc + a.price, 0) : 0}
              </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 w-12 rounded-xl p-0">
                <X className="h-5 w-5" />
              </Button>
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
            <AlertDialogAction onClick={() => { 
                setOrderItems([]); 
                setTableCarts(prev => {
                  const next = { ...prev };
                  if (selectedTable) delete next[selectedTable];
                  return next;
                });
                setClearConfirm(false); 
              }}>
              Clear Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className={showUpiQr ? "max-w-sm" : ""}>
          <DialogHeader><DialogTitle>{showUpiQr ? 'Scan to Pay' : 'Select Payment Method'}</DialogTitle></DialogHeader>
          {showUpiQr ? (
            <div className="flex flex-col items-center justify-center space-y-5 py-2">
              <div className="bg-white p-3 rounded-xl shadow-sm border">
                <QRCode value={`upi://pay?pa=${restaurantProfile?.upi_id}&pn=${restaurantProfile?.name}&am=${Math.round(total)}&cu=INR`} size={200} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">₹{Math.round(total)}</p>
                <p className="text-sm text-muted-foreground mt-1">Scan using any UPI App</p>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block mt-2">{restaurantProfile?.upi_id}</p>
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
                {paymentMethods.map(m => (
                  <Button key={m.id} variant="outline" className="h-14 text-sm font-medium"
                    onClick={() => {
                        if (m.type === 'upi' && restaurantProfile?.upi_id) {
                            setShowUpiQr(true);
                        } else {
                            handleBillAndPay(m.name);
                        }
                    }}>
                    {m.name}
                  </Button>
                ))}
                {paymentMethods.length === 0 && (
                  <>
                    <Button variant="outline" className="h-14 gap-2" onClick={() => handleBillAndPay('Cash')}>
                      <Banknote className="h-4 w-4" /> Cash
                    </Button>
                    <Button variant="outline" className="h-14 gap-2" onClick={() => {
                        if (restaurantProfile?.upi_id) setShowUpiQr(true);
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
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Held Orders Drawer */}
      <Drawer open={isHeldOrdersOpen} onOpenChange={setIsHeldOrdersOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Held Orders</DrawerTitle></DrawerHeader>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-8 max-h-[60vh] overflow-y-auto">
             {heldOrders.map((ho) => (
                 <div key={ho.id} className="border p-4 rounded-xl bg-card shadow-sm cursor-pointer hover:border-primary hover:shadow-md transition-all group" onClick={() => {
                     setOrderType(ho.orderType);
                     setOrderItems(ho.orderItems);
                     setCustomerName(ho.customerName);
                     setCustomerPhone(ho.customerPhone);
                     setDeliveryAddress(ho.deliveryAddress);
                     if (ho.orderType === 'takeaway') setTokenNumber(ho.tokenNumber);
                     if (ho.orderType === 'dine_in') setSelectedTable(ho.selectedTable);
                     setHeldOrders(prev => prev.filter(h => h.id !== ho.id));
                     setIsHeldOrdersOpen(false);
                 }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-extrabold uppercase text-xs tracking-widest text-primary">{ho.orderType.replace('_', ' ')}</div>
                      <div className="text-[10px] text-muted-foreground">{ho.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div className="font-bold text-lg leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">
                      {ho.orderType === 'dine_in' ? `Table ${allTables.find(t=>t.id===ho.selectedTable)?.number}` : ho.orderType === 'takeaway' ? `Token #${ho.tokenNumber}` : ho.customerName || 'Delivery'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{ho.orderItems.length} items • ₹{ho.orderItems.reduce((acc: number, item: any) => acc + (item.qty * item.unit_price), 0)}</div>
                 </div>
             ))}
             {heldOrders.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">No held orders available.</div>}
          </div>
          <DrawerFooter className="px-6 md:px-8 pb-8">
            <DrawerClose asChild>
              <Button variant="outline">Close List</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Printable Receipt Overlay */}
      <ThermalReceipt 
        bill={printingBill} 
        restaurant={restaurantProfile} 
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
