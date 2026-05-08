import { useState, useEffect } from 'react';
import { Save, Store, MapPin, Receipt, CreditCard, Printer, Users, ChevronRight, Check, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { db, type RestaurantProfile, type TaxConfig, type PaymentMethod, type PrinterConfig, type Floor, type TableConfig, type MenuCategory, type MenuItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('restaurant');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full h-auto">
          <TabsTrigger value="restaurant" className="text-xs gap-1.5 py-2.5"><Store className="h-3.5 w-3.5" />Restaurant</TabsTrigger>
          <TabsTrigger value="floors" className="text-xs gap-1.5 py-2.5"><MapPin className="h-3.5 w-3.5" />Floors & Tables</TabsTrigger>
          <TabsTrigger value="menu" className="text-xs gap-1.5 py-2.5"><Receipt className="h-3.5 w-3.5" />Menu</TabsTrigger>
          <TabsTrigger value="tax" className="text-xs gap-1.5 py-2.5"><Receipt className="h-3.5 w-3.5" />Tax & Charges</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs gap-1.5 py-2.5"><CreditCard className="h-3.5 w-3.5" />Payment</TabsTrigger>
          <TabsTrigger value="printer" className="text-xs gap-1.5 py-2.5"><Printer className="h-3.5 w-3.5" />Printer</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant"><RestaurantSettings /></TabsContent>
        <TabsContent value="floors"><FloorSettings /></TabsContent>
        <TabsContent value="menu"><MenuSettings /></TabsContent>
        <TabsContent value="tax"><TaxSettings /></TabsContent>
        <TabsContent value="payment"><PaymentSettings /></TabsContent>
        <TabsContent value="printer"><PrinterSettings /></TabsContent>
      </Tabs>
    </div>
  );
}

function RestaurantSettings() {
  const restaurant = useLiveQuery(() => db.restaurant.toCollection().first());
  const [form, setForm] = useState<Partial<RestaurantProfile>>({});

  useEffect(() => {
    if (restaurant) setForm(restaurant);
  }, [restaurant]);

  const handleSave = async () => {
    if (!form.id) return;
    await db.restaurant.update(form.id, { ...form, updated_at: new Date() });
    toast.success('Restaurant profile saved');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Restaurant Profile</CardTitle>
        <CardDescription>Configure your restaurant's basic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Restaurant Name *</Label>
            <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Restaurant" />
          </div>
          <div className="space-y-2">
            <Label>Cuisine Type</Label>
            <Input value={form.cuisine_type || ''} onChange={e => setForm(f => ({ ...f, cuisine_type: e.target.value }))} placeholder="Multi-Cuisine" />
          </div>
          <div className="space-y-2">
            <Label>Restaurant Type</Label>
            <Select value={form.restaurant_type} onValueChange={v => setForm(f => ({ ...f, restaurant_type: v as any }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fine_dining">Fine Dining</SelectItem>
                <SelectItem value="casual">Casual Dining</SelectItem>
                <SelectItem value="qsr">QSR / Fast Food</SelectItem>
                <SelectItem value="cloud_kitchen">Cloud Kitchen</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="bar">Bar & Lounge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Taste of Tradition" />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>Address</Label>
            <Textarea value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" className="min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input value={form.pincode || ''} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>GSTIN</Label>
            <Input value={form.gstin || ''} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="space-y-2">
            <Label>FSSAI License</Label>
            <Input value={form.fssai_license || ''} onChange={e => setForm(f => ({ ...f, fssai_license: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>PAN Number</Label>
            <Input value={form.pan_number || ''} onChange={e => setForm(f => ({ ...f, pan_number: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>UPI ID</Label>
            <Input value={form.upi_id || ''} onChange={e => setForm(f => ({ ...f, upi_id: e.target.value }))} placeholder="myrestaurant@upi" />
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Save Profile
        </Button>

        <Separator />
        
        <div className="pt-4">
          <h4 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h4>
          <p className="text-xs text-muted-foreground mb-4">Resetting the database will delete all current data and restore the default demo items and tables.</p>
          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
            onClick={async () => {
              if (confirm('Are you sure? This will delete all your current work and restore demo data.')) {
                const { clearAllData, seedDatabase } = await import('@/lib/db');
                await clearAllData();
                await seedDatabase();
                toast.success('Database reset successfully! Reloading...');
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Reset Demo Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FloorSettings() {
  const floors = useLiveQuery(() => db.floors.orderBy('display_order').toArray()) || [];
  const tables = useLiveQuery(() => db.restaurantTables.toArray()) || [];
  const [newFloor, setNewFloor] = useState('');
  const [editTable, setEditTable] = useState<Partial<TableConfig> | null>(null);

  const addFloor = async () => {
    if (!newFloor.trim()) return;
    await db.floors.add({ name: newFloor, display_order: floors.length, is_active: true });
    setNewFloor('');
    toast.success('Floor added');
  };

  const deleteFloor = async (id: number) => {
    await db.floors.delete(id);
    await db.restaurantTables.where('floor_id').equals(id).delete();
    toast.success('Floor deleted');
  };

  const addTable = async (floorId: number) => {
    const floorTables = tables.filter(t => t.floor_id === floorId);
    const nextNum = floorTables.length + 1;
    await db.restaurantTables.add({
      floor_id: floorId,
      number: `T${tables.length + 1}`,
      capacity: 4,
      shape: 'square',
      status: 'available',
      is_active: true,
    });
    toast.success('Table added');
  };

  const saveTable = async () => {
    if (!editTable?.id) return;
    await db.restaurantTables.update(editTable.id, editTable);
    setEditTable(null);
    toast.success('Table updated');
  };

  const deleteTable = async (id: number) => {
    await db.restaurantTables.delete(id);
    toast.success('Table deleted');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Floor & Table Configuration</CardTitle>
          <CardDescription>Define dining areas and table layout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={newFloor} onChange={e => setNewFloor(e.target.value)} placeholder="New floor name (e.g. Rooftop)" className="max-w-xs" />
            <Button onClick={addFloor} size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Floor</Button>
          </div>

          {floors.map(floor => (
            <div key={floor.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{floor.name}</h3>
                  <Badge variant="outline">{tables.filter(t => t.floor_id === floor.id).length} tables</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => addTable(floor.id!)} className="gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add Table
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteFloor(floor.id!)} className="text-destructive h-8 w-8 p-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {tables.filter(t => t.floor_id === floor.id).map(table => (
                  <div key={table.id} className="rounded-lg border p-2 text-center text-xs space-y-1 group relative">
                    <div className="font-bold text-foreground">{table.number}</div>
                    <div className="text-muted-foreground">{table.capacity} seats</div>
                    <div className="text-muted-foreground capitalize">{table.shape}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 flex gap-0.5">
                      <button onClick={() => setEditTable(table)} className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                        <Edit2 className="h-2.5 w-2.5 text-primary" />
                      </button>
                      <button onClick={() => deleteTable(table.id!)} className="h-5 w-5 rounded bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="h-2.5 w-2.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!editTable} onOpenChange={() => setEditTable(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Table</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Table Number</Label><Input value={editTable?.number || ''} onChange={e => setEditTable(t => t ? ({ ...t, number: e.target.value }) : null)} /></div>
            <div className="space-y-1"><Label>Capacity</Label><Input type="number" value={editTable?.capacity || ''} onChange={e => setEditTable(t => t ? ({ ...t, capacity: Number(e.target.value) }) : null)} /></div>
            <div className="space-y-1">
              <Label>Shape</Label>
              <Select value={editTable?.shape} onValueChange={v => setEditTable(t => t ? ({ ...t, shape: v as any }) : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveTable}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuSettings() {
  const categories = useLiveQuery(() => db.menuCategories.orderBy('display_order').toArray()) || [];
  const items = useLiveQuery(() => db.menuItems.toArray()) || [];
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await db.menuCategories.add({ name: newCatName, display_order: categories.length, is_active: true, item_count: 0 });
    setNewCatName('');
    toast.success('Category added');
  };

  const deleteCategory = async (id: number) => {
    await db.menuCategories.delete(id);
    await db.menuItems.where('category_id').equals(id).delete();
    toast.success('Category deleted');
  };

  const catItems = selectedCat ? items.filter(i => i.category_id === selectedCat) : [];

  const saveItem = async () => {
    if (!editItem?.name || !editItem?.price) return;
    if (editItem.id) {
      await db.menuItems.update(editItem.id, { ...editItem, updated_at: new Date() });
    } else {
      await db.menuItems.add({ ...editItem as any, created_at: new Date(), updated_at: new Date() });
      // Update count
      if (editItem.category_id) {
        const count = await db.menuItems.where('category_id').equals(editItem.category_id).count();
        await db.menuCategories.update(editItem.category_id, { item_count: count });
      }
    }
    setEditItem(null);
    setShowAddItem(false);
    toast.success('Menu item saved');
  };

  const deleteItem = async (id: number, catId: number) => {
    await db.menuItems.delete(id);
    const count = await db.menuItems.where('category_id').equals(catId).count();
    await db.menuCategories.update(catId, { item_count: count });
    toast.success('Item deleted');
  };

  const toggleAvailability = async (item: MenuItem) => {
    await db.menuItems.update(item.id!, { is_available: !item.is_available });
  };

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 h-[calc(100vh-14rem)]">
      {/* Categories sidebar */}
      <Card className="flex flex-col">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex-1">
          <div className="flex gap-1 mb-2 px-2">
            <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category" className="h-8 text-xs" />
            <Button size="sm" className="h-8 px-2" onClick={addCategory}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id!)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCat === cat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                }`}>
                <span className="truncate">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <Badge variant={selectedCat === cat.id ? 'secondary' : 'outline'} className="text-[10px] h-5">
                    {items.filter(i => i.category_id === cat.id).length}
                  </Badge>
                  <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id!); }}
                    className="h-5 w-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10">
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              </button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Items panel */}
      <Card className="flex flex-col">
        <CardHeader className="py-3 px-4 flex-row items-center justify-between">
          <CardTitle className="text-sm">{selectedCat ? categories.find(c => c.id === selectedCat)?.name : 'Select a category'}</CardTitle>
          {selectedCat && (
            <Button size="sm" className="gap-1 text-xs" onClick={() => { setEditItem({ category_id: selectedCat, price: 0, item_type: 'veg', is_available: true, is_hidden: false, tax_rate: 5 }); setShowAddItem(true); }}>
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-2 flex-1">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-1">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-sm border-2 ${
                      item.item_type === 'veg' ? 'border-green-600 bg-green-600' :
                      item.item_type === 'non-veg' ? 'border-red-600 bg-red-600' :
                      'border-amber-500 bg-amber-500'
                    }`} />
                    <div>
                      <div className="font-medium text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">₹{item.price} • GST {item.tax_rate}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={item.is_available} onCheckedChange={() => toggleAvailability(item)} />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditItem(item); setShowAddItem(true); }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteItem(item.id!, item.category_id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {selectedCat && catItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No items in this category</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit/Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Name *</Label><Input value={editItem?.name || ''} onChange={e => setEditItem(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Price (₹) *</Label><Input type="number" value={editItem?.price || ''} onChange={e => setEditItem(f => f ? ({ ...f, price: Number(e.target.value) }) : null)} /></div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={editItem?.item_type} onValueChange={v => setEditItem(f => f ? ({ ...f, item_type: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">🟢 Veg</SelectItem>
                    <SelectItem value="non-veg">🔴 Non-Veg</SelectItem>
                    <SelectItem value="egg">🟡 Egg</SelectItem>
                    <SelectItem value="vegan">🌱 Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Tax Rate (%)</Label><Input type="number" value={editItem?.tax_rate || ''} onChange={e => setEditItem(f => f ? ({ ...f, tax_rate: Number(e.target.value) }) : null)} /></div>
              <div className="space-y-1"><Label>HSN Code</Label><Input value={editItem?.hsn_code || ''} onChange={e => setEditItem(f => f ? ({ ...f, hsn_code: e.target.value }) : null)} /></div>
            </div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={editItem?.description || ''} onChange={e => setEditItem(f => f ? ({ ...f, description: e.target.value }) : null)} className="min-h-[60px]" /></div>
            
            {/* Addons Manager */}
            <div className="space-y-2 border-t pt-3 mt-4">
              <div className="flex items-center justify-between">
                <Label>Customizations / Add-ons</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => {
                  setEditItem(f => f ? ({ ...f, addons: [...(f.addons || []), { id: crypto.randomUUID(), name: '', price: 0 }] }) : null);
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {editItem?.addons?.map((addon, index) => (
                <div key={addon.id} className="flex items-center gap-2">
                  <Input placeholder="e.g. Extra Cheese, Spicy" value={addon.name} className="h-8 text-sm flex-1"
                    onChange={e => setEditItem(f => {
                      if (!f) return null;
                      const addons = [...(f.addons || [])];
                      addons[index].name = e.target.value;
                      return { ...f, addons };
                    })} 
                  />
                  <Input type="number" placeholder="Price" value={addon.price === 0 ? '' : addon.price} className="h-8 text-sm w-20 flex-shrink-0"
                    onChange={e => setEditItem(f => {
                      if (!f) return null;
                      const addons = [...(f.addons || [])];
                      addons[index].price = Number(e.target.value);
                      return { ...f, addons };
                    })} 
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive flex-shrink-0"
                    onClick={() => setEditItem(f => {
                      if (!f) return null;
                      return { ...f, addons: f.addons?.filter((_, i) => i !== index) };
                    })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={saveItem}>Save Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaxSettings() {
  const taxes = useLiveQuery(() => db.taxConfig.toArray()) || [];
  const [editTax, setEditTax] = useState<Partial<TaxConfig> | null>(null);

  const saveTax = async () => {
    if (!editTax) return;
    if (editTax.id) {
      await db.taxConfig.update(editTax.id, editTax);
    } else {
      await db.taxConfig.add(editTax as TaxConfig);
    }
    setEditTax(null);
    toast.success('Tax configuration saved');
  };

  const toggleTax = async (tax: TaxConfig) => {
    await db.taxConfig.update(tax.id!, { is_active: !tax.is_active });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle className="text-lg">Tax & Charge Configuration</CardTitle><CardDescription>Configure GST slabs, service charges, and other fees</CardDescription></div>
        <Button size="sm" onClick={() => setEditTax({ name: '', rate: 0, type: 'gst', is_active: true, is_inclusive: false })} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Tax
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {taxes.map(tax => (
            <div key={tax.id} className="flex items-center justify-between px-4 py-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Switch checked={tax.is_active} onCheckedChange={() => toggleTax(tax)} />
                <div>
                  <div className="font-medium text-sm">{tax.name}</div>
                  <div className="text-xs text-muted-foreground">{tax.type.toUpperCase()} • {tax.rate}% • {tax.is_inclusive ? 'Inclusive' : 'Exclusive'}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditTax(tax)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => db.taxConfig.delete(tax.id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!editTax} onOpenChange={() => setEditTax(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTax?.id ? 'Edit Tax' : 'Add Tax'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={editTax?.name || ''} onChange={e => setEditTax(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Rate (%)</Label><Input type="number" step="0.5" value={editTax?.rate || ''} onChange={e => setEditTax(f => f ? ({ ...f, rate: Number(e.target.value) }) : null)} /></div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={editTax?.type} onValueChange={v => setEditTax(f => f ? ({ ...f, type: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gst">GST</SelectItem>
                    <SelectItem value="cgst">CGST</SelectItem>
                    <SelectItem value="sgst">SGST</SelectItem>
                    <SelectItem value="igst">IGST</SelectItem>
                    <SelectItem value="service_charge">Service Charge</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editTax?.is_inclusive || false} onCheckedChange={v => setEditTax(f => f ? ({ ...f, is_inclusive: v }) : null)} />
              <Label>Tax Inclusive in Price</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={saveTax}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PaymentSettings() {
  const methods = useLiveQuery(() => db.paymentMethods.orderBy('display_order').toArray()) || [];
  const [editMethod, setEditMethod] = useState<Partial<PaymentMethod> | null>(null);

  const saveMethod = async () => {
    if (!editMethod) return;
    if (editMethod.id) {
      await db.paymentMethods.update(editMethod.id, editMethod);
    } else {
      await db.paymentMethods.add(editMethod as PaymentMethod);
    }
    setEditMethod(null);
    toast.success('Payment method saved');
  };

  const toggleMethod = async (m: PaymentMethod) => {
    await db.paymentMethods.update(m.id!, { is_active: !m.is_active });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle className="text-lg">Payment Methods</CardTitle><CardDescription>Configure accepted payment methods</CardDescription></div>
        <Button size="sm" onClick={() => setEditMethod({ name: '', type: 'cash', is_active: true, display_order: methods.length })} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Method
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {methods.map(m => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Switch checked={m.is_active} onCheckedChange={() => toggleMethod(m)} />
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{m.type}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditMethod(m)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => db.paymentMethods.delete(m.id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!editMethod} onOpenChange={() => setEditMethod(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editMethod?.id ? 'Edit' : 'Add'} Payment Method</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={editMethod?.name || ''} onChange={e => setEditMethod(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={editMethod?.type} onValueChange={v => setEditMethod(f => f ? ({ ...f, type: v as any }) : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                  <SelectItem value="gateway">Payment Gateway</SelectItem>
                  <SelectItem value="credit">Credit/House Account</SelectItem>
                  <SelectItem value="complimentary">Complimentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveMethod}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PrinterSettings() {
  const printers = useLiveQuery(() => db.printers.toArray()) || [];
  const [editPrinter, setEditPrinter] = useState<Partial<PrinterConfig> | null>(null);

  const savePrinter = async () => {
    if (!editPrinter) return;
    if (editPrinter.id) {
      await db.printers.update(editPrinter.id, editPrinter);
    } else {
      await db.printers.add(editPrinter as PrinterConfig);
    }
    setEditPrinter(null);
    toast.success('Printer saved');
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle className="text-lg">Printer & Hardware Setup</CardTitle><CardDescription>Configure thermal printers for bills and KOTs</CardDescription></div>
        <Button size="sm" onClick={() => setEditPrinter({ name: '', type: 'bill', connection: 'usb', paper_width: '80mm', is_default: false, is_active: true })} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Printer
        </Button>
      </CardHeader>
      <CardContent>
        {printers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Printer className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No printers configured. Add a printer to start printing bills and KOTs.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {printers.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Printer className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.type} • {p.connection} • {p.paper_width}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_default && <Badge className="text-[10px]">Default</Badge>}
                  <Switch checked={p.is_active} onCheckedChange={async () => { await db.printers.update(p.id!, { is_active: !p.is_active }); }} />
                  <Button variant="ghost" size="sm" onClick={() => setEditPrinter(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editPrinter} onOpenChange={() => setEditPrinter(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editPrinter?.id ? 'Edit' : 'Add'} Printer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Printer Name</Label><Input value={editPrinter?.name || ''} onChange={e => setEditPrinter(f => f ? ({ ...f, name: e.target.value }) : null)} placeholder="e.g. Kitchen Printer 1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Printer Type</Label>
                <Select value={editPrinter?.type} onValueChange={v => setEditPrinter(f => f ? ({ ...f, type: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bill">Bill Printer</SelectItem>
                    <SelectItem value="kot">KOT (Kitchen)</SelectItem>
                    <SelectItem value="bar">Bar Printer</SelectItem>
                    <SelectItem value="label">Label Printer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Connection</Label>
                <Select value={editPrinter?.connection} onValueChange={v => setEditPrinter(f => f ? ({ ...f, connection: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="lan">Network (LAN)</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Paper Width</Label>
                <Select value={editPrinter?.paper_width} onValueChange={v => setEditPrinter(f => f ? ({ ...f, paper_width: v as any }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="57mm">57mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editPrinter?.connection === 'lan' && (
                <div className="space-y-1"><Label>IP Address</Label><Input value={editPrinter?.ip_address || ''} onChange={e => setEditPrinter(f => f ? ({ ...f, ip_address: e.target.value }) : null)} placeholder="192.168.1.100" /></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editPrinter?.is_default || false} onCheckedChange={v => setEditPrinter(f => f ? ({ ...f, is_default: v }) : null)} />
              <Label>Set as Default Printer</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={savePrinter}>Save Printer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
