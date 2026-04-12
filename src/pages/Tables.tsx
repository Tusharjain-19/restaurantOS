import { useState } from 'react';
import { Grid3X3, Users, Clock, ArrowRightLeft, Merge, Split, Lock, Unlock, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { db, type TableConfig } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  available: { label: 'Available', bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  occupied: { label: 'Occupied', bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
  reserved: { label: 'Reserved', bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  dirty: { label: 'Cleaning', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  blocked: { label: 'Blocked', bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' },
};

export default function Tables() {
  const floors = useLiveQuery(() => db.floors.orderBy('display_order').toArray()) || [];
  const tables = useLiveQuery(() => db.restaurantTables.toArray()) || [];
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState<number | null>(null);

  const floorId = selectedFloor || (floors[0]?.id ?? null);
  const floorTables = tables.filter(t => t.floor_id === floorId);

  const statusCounts = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    dirty: tables.filter(t => t.status === 'dirty').length,
  };

  const changeStatus = async (table: TableConfig, status: TableConfig['status']) => {
    await db.restaurantTables.update(table.id!, { status });
    setSelectedTable(null);
    toast.success(`${table.number} → ${STATUS_CONFIG[status]?.label}`);
  };

  const transferTable = async () => {
    if (!selectedTable || !transferTarget) return;
    // Swap statuses
    const target = tables.find(t => t.id === transferTarget);
    if (!target) return;
    await db.restaurantTables.update(selectedTable.id!, { status: 'available' });
    await db.restaurantTables.update(transferTarget, { status: 'occupied' });
    toast.success(`Order transferred from ${selectedTable.number} to ${target.number}`);
    setShowTransfer(false);
    setSelectedTable(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Table Management</h1>
          <p className="text-sm text-muted-foreground">Real-time floor plan view</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => {
          await db.restaurantTables.where('status').equals('dirty').modify({ status: 'available' });
          toast.success('All dirty tables cleaned');
        }} className="gap-1.5">
          <RefreshCcw className="h-3.5 w-3.5" /> Clean All
        </Button>
      </div>

      {/* Status Legend */}
      <div className="flex gap-3">
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'blocked').map(([key, { label, bg, text }]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", bg, text === 'text-success' ? 'bg-success' : text === 'text-destructive' ? 'bg-destructive' : text === 'text-warning' ? 'bg-warning' : 'bg-blue-500')} />
            <span className="text-xs text-muted-foreground">{label}: <span className="font-bold text-foreground">{statusCounts[key as keyof typeof statusCounts]}</span></span>
          </div>
        ))}
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-1 border-b pb-2">
        {floors.map(f => (
          <button key={f.id} onClick={() => setSelectedFloor(f.id!)}
            className={cn("px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2",
              floorId === f.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {f.name}
            <Badge variant="outline" className="ml-2 text-[10px]">{tables.filter(t => t.floor_id === f.id).length}</Badge>
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {floorTables.map(table => {
          const sc = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
          return (
            <button key={table.id} onClick={() => setSelectedTable(table)}
              className={cn(
                "rounded-xl p-4 text-center border-2 transition-all hover:shadow-lg group relative",
                sc.bg, sc.border,
                selectedTable?.id === table.id && "ring-2 ring-primary shadow-lg",
                table.shape === 'round' && 'rounded-full aspect-square flex flex-col items-center justify-center',
              )}>
              <div className="font-bold text-lg text-foreground">{table.number}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {table.capacity}
              </div>
              <div className={cn("text-[10px] font-semibold capitalize mt-1", sc.text)}>
                {sc.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Action Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTable?.number} — Actions
              <Badge variant="outline" className={cn('text-xs', STATUS_CONFIG[selectedTable?.status || 'available']?.text)}>
                {STATUS_CONFIG[selectedTable?.status || 'available']?.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => selectedTable && changeStatus(selectedTable, 'available')}>
              <Unlock className="h-4 w-4 text-success" /> Mark Available
            </Button>
            <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => selectedTable && changeStatus(selectedTable, 'occupied')}>
              <Users className="h-4 w-4 text-destructive" /> Mark Occupied
            </Button>
            <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => selectedTable && changeStatus(selectedTable, 'reserved')}>
              <Clock className="h-4 w-4 text-warning" /> Reserve
            </Button>
            <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => selectedTable && changeStatus(selectedTable, 'dirty')}>
              <RefreshCcw className="h-4 w-4 text-blue-500" /> Mark Dirty
            </Button>
            <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => selectedTable && changeStatus(selectedTable, 'blocked')}>
              <Lock className="h-4 w-4" /> Block
            </Button>
            {selectedTable?.status === 'occupied' && (
              <Button variant="outline" className="h-12 text-xs gap-1.5" onClick={() => setShowTransfer(true)}>
                <ArrowRightLeft className="h-4 w-4 text-accent" /> Transfer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transfer Order from {selectedTable?.number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select the target table:</p>
            <div className="grid grid-cols-4 gap-2">
              {tables.filter(t => t.status === 'available' && t.id !== selectedTable?.id).map(t => (
                <button key={t.id} onClick={() => setTransferTarget(t.id!)}
                  className={cn("rounded-lg border-2 p-2 text-center text-xs", transferTarget === t.id ? "border-primary bg-primary/5" : "border-border")}>
                  <div className="font-bold">{t.number}</div>
                  <div className="text-[10px] text-muted-foreground">{t.capacity} seats</div>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={transferTable} disabled={!transferTarget}>Transfer Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
