import { useState, useEffect } from 'react';
import { Plus, X, Users, Clock, IndianRupee, Phone, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFloors, useTables } from '@/hooks/useRestaurantData';
import { useRestaurantRealtime } from '@/hooks/useRestaurantRealtime';

export default function Tables() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;

  const { data: floors = [] } = useFloors(restaurantId);
  const { data: tables = [] } = useTables(restaurantId);

  // Subscribe to real-time updates
  useRestaurantRealtime(restaurantId);

  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // Initialize selected floor when floors are loaded
  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors, selectedFloor]);

  const floorTables = tables.filter(t => t.floor_id === selectedFloor);
  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    totalCovers: tables.filter(t => t.status === 'occupied').reduce((s, t) => s + t.capacity, 0),
    revenue: tables.filter(t => t.status === 'occupied').reduce((s, t) => s + ((t as any).order_amount || 0), 0),
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-4 md:-m-6">
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floor Tabs */}
        <div className="flex items-center gap-3 px-4 py-2 border-b">
          <div className="flex gap-1">
            {floors.map(f => {
              const count = tables.filter(t => t.floor_id === f.id).length;
              return (
                <button key={f.id} onClick={() => setSelectedFloor(f.id)}
                  className={cn("text-xs px-3 py-1.5 rounded-md transition-colors",
                    selectedFloor === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}>
                  {f.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 px-4 py-2 border-b bg-muted/30 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Available: <b className="text-foreground">{stats.available}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Occupied: <b className="text-foreground">{stats.occupied}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" />
            Reserved: <b className="text-foreground">{stats.reserved}</b>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground">
            <Users className="h-3 w-3 inline mr-1" />Covers: <b className="text-foreground">{stats.totalCovers}</b>
          </span>
          <span className="text-muted-foreground">
            <IndianRupee className="h-3 w-3 inline mr-0.5" />Today: <b className="text-foreground">₹{stats.revenue.toLocaleString()}</b>
          </span>
        </div>

        {/* Table Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {floorTables.map(table => (
              <button key={table.id} onClick={() => setSelectedTable(table)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all hover:shadow-md text-left",
                  table.shape === 'round' && "rounded-[50%] aspect-square flex flex-col items-center justify-center text-center",
                  table.shape === 'rectangle' && "col-span-2",
                  table.status === 'available' && "bg-success/5 border-success/30 hover:border-success",
                  table.status === 'occupied' && "bg-destructive/5 border-destructive/30 hover:border-destructive",
                  table.status === 'reserved' && "bg-warning/5 border-warning/30 hover:border-warning",
                  table.status === 'dirty' && "bg-muted border-muted-foreground/20",
                  table.status === 'blocked' && "bg-muted/50 border-muted-foreground/10 opacity-50",
                  selectedTable?.id === table.id && "ring-2 ring-primary",
                )}>
                {table.status === 'occupied' && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
                <div className="text-lg font-bold text-foreground">{table.number}</div>
                <div className="text-[10px] text-muted-foreground">{table.capacity} seats</div>
                {table.status === 'occupied' && (
                  <div className="mt-1">
                    <div className="text-xs font-bold text-destructive">₹{(table as any).order_amount || 0}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {(table as any).order_time || '0m'}
                    </div>
                  </div>
                )}
                {table.status === 'reserved' && (
                  <div className="mt-1 text-[10px] text-warning font-medium">{(table as any).reservation_name}<br/>{(table as any).reservation_time}</div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="flex gap-2 p-3 border-t">
          <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> New Walk-in</Button>
          <Button size="sm" variant="outline" className="text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1" /> Reservation</Button>
        </div>
      </div>

      {/* Right Detail Panel */}
      {selectedTable && (
        <div className="w-[300px] border-l bg-card flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-bold text-foreground">{selectedTable.number}</h3>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedTable(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-3 space-y-3">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-muted">
                  <div className="text-muted-foreground">Floor</div>
                  <div className="font-medium text-foreground">{floors.find(f => f.id === selectedTable.floor_id)?.name}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                  <div className="text-muted-foreground">Capacity</div>
                  <div className="font-medium text-foreground">{selectedTable.capacity} seats</div>
                </div>
                <div className="p-2 rounded bg-muted">
                  <div className="text-muted-foreground">Shape</div>
                  <div className="font-medium text-foreground capitalize">{selectedTable.shape}</div>
                </div>
                <div className="p-2 rounded bg-muted">
                  <div className="text-muted-foreground">Status</div>
                  <Badge variant="outline" className={cn("text-[10px]",
                    selectedTable.status === 'available' && "text-success border-success",
                    selectedTable.status === 'occupied' && "text-destructive border-destructive",
                    selectedTable.status === 'reserved' && "text-warning border-warning",
                  )}>{selectedTable.status}</Badge>
                </div>
              </div>

              <Separator />

              {selectedTable.status === 'available' && (
                <div className="space-y-2">
                  <Button className="w-full text-xs h-9">New Dine-In Order</Button>
                  <Button variant="outline" className="w-full text-xs h-9">Reserve Table</Button>
                  <Button variant="ghost" className="w-full text-xs h-9 text-muted-foreground">Mark as Dirty</Button>
                </div>
              )}

              {selectedTable.status === 'occupied' && (
                <div className="space-y-3">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Waiter:</span><span className="text-foreground">{selectedTable.waiter || 'Unknown'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span className="text-foreground">{selectedTable.order_time || '0m'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-bold text-foreground">₹{selectedTable.order_amount || 0}</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <Button className="w-full text-xs h-9">View Order</Button>
                    <Button variant="outline" className="w-full text-xs h-9">Transfer Table</Button>
                    <Button variant="outline" className="w-full text-xs h-9">Merge Tables</Button>
                    <Button variant="secondary" className="w-full text-xs h-9 bg-accent text-accent-foreground">Request Bill</Button>
                  </div>
                </div>
              )}

              {selectedTable.status === 'reserved' && (
                <div className="space-y-3">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Guest:</span><span className="text-foreground">{selectedTable.reservation_name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span className="text-foreground">{selectedTable.reservation_time}</span></div>
                  </div>
                  <Button className="w-full text-xs h-9">Seat Reservation</Button>
                  <Button variant="destructive" className="w-full text-xs h-9">Cancel Reservation</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
