import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Clock, AlertTriangle, Printer, Plus, CheckCircle, Flame, ChefHat, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MOCK_KITCHEN_ORDERS, type KitchenOrder } from '@/lib/mock-data';

// Helper to play synthesized chimes using Web Audio API
function playChime(muted: boolean) {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Low tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);

    // High tone following shortly
    setTimeout(() => {
      if (ctx.state === 'closed') return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime); // A5
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.25);
    }, 120);
  } catch (e) {
    console.error('Failed to play Audio chime:', e);
  }
}

export default function Kitchen() {
  const [orders, setOrders] = useState<KitchenOrder[]>(MOCK_KITCHEN_ORDERS);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_prep' | 'ready'>('all');
  const [muted, setMuted] = useState(true); // default to muted to comply with browser autoplay policies
  const [currentTime, setCurrentTime] = useState(new Date());
  const [printingKot, setPrintingKot] = useState<KitchenOrder | null>(null);
  
  const prevOrderCountRef = useRef(orders.length);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor incoming orders to play alert chime
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      playChime(muted);
      toast.info('New Kitchen Order Ticket (KOT) received!');
    }
    prevOrderCountRef.current = orders.length;
  }, [orders, muted]);

  // Handle status changes
  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (o.status === 'new') return { ...o, status: 'in_prep' as const };
      if (o.status === 'in_prep') return { ...o, status: 'ready' as const };
      return o;
    }));
  };

  // Complete / Clear order from board
  const completeOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    toast.success('Order completed and cleared from display');
  };

  // Dev helper to add a test order
  const triggerTestOrder = () => {
    const newKOT: KitchenOrder = {
      id: `ko-test-${Date.now()}`,
      table_number: `T${Math.floor(Math.random() * 3) + 1}`,
      order_type: 'Dine-In',
      kot_number: orders.length + 10,
      created_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      elapsed_minutes: 0,
      status: 'new',
      is_priority: Math.random() > 0.6,
      is_addon: Math.random() > 0.7,
      items: [
        { name: 'Paneer Tikka', qty: Math.floor(Math.random() * 2) + 1, variant: 'Full', item_type: 'veg' },
        { name: 'Paneer Butter Masala', qty: 1, item_type: 'veg', special_instructions: 'Extra butter' }
      ]
    };
    setOrders(prev => [...prev, newKOT]);
  };

  // Filter & sorting
  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a, b) => {
    // Priority KOTs always go first
    if (a.is_priority && !b.is_priority) return -1;
    if (b.is_priority && !a.is_priority) return 1;
    // Otherwise oldest first
    return b.elapsed_minutes - a.elapsed_minutes;
  });

  const pendingCount = orders.filter(o => o.status !== 'ready').length;
  const inPrepCount = orders.filter(o => o.status === 'in_prep').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  const handlePrintClick = (kot: KitchenOrder) => {
    setPrintingKot(kot);
    setTimeout(() => {
      window.print();
      setPrintingKot(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-[#0c0d12] text-slate-100 flex flex-col z-[100] font-sans select-none overflow-hidden">
      {/* Printable Area - Hidden on Screen */}
      {printingKot && (
        <div id="printable-kot" className="hidden print:block text-black bg-white p-4 font-mono text-xs w-[80mm] leading-tight">
          <div className="text-center font-bold text-sm uppercase border-b-2 border-dashed border-black pb-2 mb-2">
            *** KITCHEN ORDER TICKET ***
          </div>
          <div className="space-y-1 mb-2">
            <div><b>KOT #:</b> {printingKot.kot_number.toString().padStart(3, '0')}</div>
            <div><b>Table:</b> {printingKot.table_number}</div>
            <div><b>Type:</b> {printingKot.order_type}</div>
            <div><b>Time:</b> {printingKot.created_at}</div>
          </div>
          <div className="border-t border-b border-black py-1 my-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-1">ITEM</th>
                  <th className="text-center py-1">QTY</th>
                </tr>
              </thead>
              <tbody>
                {printingKot.items.map((item, idx) => (
                  <tr key={idx} className="align-top font-bold text-sm">
                    <td className="py-1">
                      {item.name} {item.variant ? `[${item.variant}]` : ''}
                      {item.special_instructions && <div className="text-xs font-normal italic">*{item.special_instructions}</div>}
                    </td>
                    <td className="text-center py-1">{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center text-[10px] pt-4">
            -- End of Ticket --
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-16 shrink-0 border-b border-slate-800 bg-[#12131a]/85 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/10 text-orange-500 border border-orange-500/20">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-2 text-white">
              Kitchen Display System (KDS)
              <Badge variant="outline" className="text-[10px] bg-slate-800 border-slate-700 text-slate-400 font-mono">
                LOCAL STORAGE ACTIVE
              </Badge>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Manage and print kitchen tickets</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-4">
          {/* Board Stats */}
          <div className="hidden lg:flex items-center gap-5 bg-slate-900/60 border border-slate-800 px-4 py-1.5 rounded-xl text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-500" /> Pending: <strong className="text-white font-bold">{pendingCount}</strong></span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-400" /> Preparing: <strong className="text-white font-bold">{inPrepCount}</strong></span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Ready: <strong className="text-white font-bold">{readyCount}</strong></span>
          </div>

          {/* Sound Controls */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => { setMuted(!muted); playChime(!muted); }}
            className={cn(
              "h-9 rounded-xl border border-slate-800 text-xs font-semibold px-3 gap-2 transition-all",
              muted ? "bg-slate-900/50 hover:bg-slate-800 text-slate-400" : "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
            )}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? 'Sound Muted' : 'Sound Enabled'}
          </Button>

          {/* Dev Test Ticket trigger */}
          <Button 
            size="sm" 
            onClick={triggerTestOrder}
            className="h-9 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-3 gap-1.5 shadow-lg shadow-orange-950/20"
          >
            <Plus className="h-4 w-4" /> Test Order
          </Button>

          {/* Exit Link */}
          <a 
            href="/dashboard" 
            className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Main KDS Grid Layout */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#07080c] relative">
        {/* Subheader Filter Tabs */}
        <div className="h-12 shrink-0 border-b border-slate-900 bg-[#0d0e15] flex items-center justify-between px-6">
          <div className="flex items-center gap-1.5">
            {(['all', 'new', 'in_prep', 'ready'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all",
                  filter === tab
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.replace('_', ' ')} ({tab === 'all' ? orders.length : tab === 'new' ? orders.filter(o => o.status === 'new').length : tab === 'in_prep' ? inPrepCount : readyCount})
              </button>
            ))}
          </div>

          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Grid Scroll Body */}
        <div className="flex-1 overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex gap-4 h-full items-start">
            {filteredOrders.map(order => (
              <KitchenCard 
                key={order.id} 
                order={order} 
                onAdvance={() => advanceStatus(order.id)} 
                onComplete={() => completeOrder(order.id)}
                onPrint={() => handlePrintClick(order)}
              />
            ))}

            {filteredOrders.length === 0 && (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <ChefHat className="h-16 w-16 text-slate-700 mb-3 animate-pulse" />
                <p className="text-sm font-semibold">Kitchen display is clear!</p>
                <p className="text-xs text-slate-600 mt-1">Press "Test Order" to generate mock KOT tickets</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        #printable-kot { display: none; }
        @media print {
          body * { display: none !important; }
          #printable-kot, #printable-kot * { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function KitchenCard({ 
  order, 
  onAdvance, 
  onComplete,
  onPrint
}: { 
  order: KitchenOrder; 
  onAdvance: () => void; 
  onComplete: () => void;
  onPrint: () => void;
}) {
  const isDelayed = order.elapsed_minutes >= 10;
  const isUrgent = order.elapsed_minutes >= 5;

  const headerColor = order.status === 'new'
    ? 'from-blue-600 to-sky-600'
    : order.status === 'in_prep'
      ? 'from-amber-600 to-orange-600'
      : 'from-emerald-600 to-teal-600';

  const actionLabel = order.status === 'new' 
    ? 'Start Prep' 
    : order.status === 'in_prep' 
      ? 'Ready to Serve' 
      : 'Done & Clear';

  return (
    <div className={cn(
      "w-[290px] shrink-0 rounded-2xl border bg-[#111219] flex flex-col overflow-hidden transition-all duration-300",
      isDelayed 
        ? "border-red-500/40 shadow-lg shadow-red-950/15" 
        : isUrgent 
          ? "border-amber-500/40 shadow-md shadow-amber-950/10" 
          : "border-slate-800",
      order.is_priority && "ring-2 ring-red-600 ring-offset-2 ring-offset-[#07080c]"
    )}>
      {/* Card Header */}
      <div className={cn("px-4 py-3 bg-gradient-to-r flex items-center justify-between text-white shadow-sm", headerColor)}>
        <div>
          <div className="font-extrabold text-base flex items-center gap-1.5">
            {order.table_number}
            {order.is_priority && (
              <Badge className="bg-red-600 hover:bg-red-700 text-white font-black text-[9px] px-1 py-0 h-4 border-0">VIP</Badge>
            )}
          </div>
          <div className="text-[10px] font-bold tracking-wider opacity-85 uppercase mt-0.5">{order.order_type}</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-xs">{order.created_at}</div>
          <div className="text-[9px] opacity-75 font-semibold mt-0.5">KOT #{order.kot_number.toString().padStart(3, '0')}</div>
        </div>
      </div>

      {/* Delay Info */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Time Elapsed: 
          <span className={cn(
            "font-black text-sm",
            isDelayed ? "text-red-400 animate-pulse" : isUrgent ? "text-amber-400" : "text-slate-200"
          )}>{order.elapsed_minutes}m</span>
        </span>

        {order.is_addon && (
          <Badge className="bg-orange-500/10 border-orange-500/30 text-orange-500 font-bold text-[9px] py-0 px-1.5 h-4">ADD-ON</Badge>
        )}
      </div>

      {/* Card Items List */}
      <div className="flex-1 px-4 py-3 space-y-3 min-h-[140px] overflow-y-auto max-h-[220px]">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between border-b border-slate-900/40 pb-2 last:border-0 last:pb-0">
            <div className="space-y-0.5 flex-1 pr-2">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  item.item_type === 'veg' ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-slate-100 font-extrabold text-sm leading-snug">
                  {item.qty} x {item.name}
                </span>
              </div>
              {item.variant && (
                <div className="text-[10px] font-bold text-slate-400 ml-3.5">
                  [{item.variant}]
                </div>
              )}
              {item.special_instructions && (
                <div className="text-[10px] font-semibold text-yellow-400 ml-3.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
                  {item.special_instructions}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Card Bottom Controls */}
      <div className="p-3 bg-slate-900/30 border-t border-slate-900 flex gap-2">
        {/* Print KOT */}
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onPrint}
          className="h-10 w-10 shrink-0 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Print KOT Ticket"
        >
          <Printer className="h-4 w-4" />
        </Button>

        {/* Complete/Transition */}
        <Button 
          onClick={order.status === 'ready' ? onComplete : onAdvance} 
          size="sm"
          className={cn(
            "flex-1 h-10 rounded-xl text-xs font-bold font-mono tracking-wide text-white border-0",
            order.status === 'new' 
              ? "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-950/20" 
              : order.status === 'in_prep' 
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-950/20" 
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-950/20"
          )}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
