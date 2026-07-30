import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Package, Search, AlertTriangle, TrendingDown, Plus, Edit2, Trash2, ShoppingCart, ArrowDownCircle, BarChart3, Leaf, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { db, type Ingredient, type Vendor, type PurchaseOrder, type WastageLog } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/export';

export default function Inventory() {
  const [tab, setTab] = useState('stock');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-auto">
          <TabsTrigger value="stock" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Stock</TabsTrigger>
          <TabsTrigger value="vendors" className="gap-1.5 text-xs"><ShoppingCart className="h-3.5 w-3.5" />Vendors</TabsTrigger>
          <TabsTrigger value="purchase" className="gap-1.5 text-xs"><ArrowDownCircle className="h-3.5 w-3.5" />Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="stock"><StockView /></TabsContent>
        <TabsContent value="vendors"><VendorView /></TabsContent>
        <TabsContent value="purchase"><PurchaseView /></TabsContent>
      </Tabs>
    </div>
  );
}

function StockView() {
  const ingredients = useLiveQuery(() => db.ingredients.toArray()) || [];
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editItem, setEditItem] = useState<Partial<Ingredient> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(ingredients.map(i => i.category))];
  const filtered = ingredients.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const lowStock = ingredients.filter(i => i.status === 'low').length;
  const outStock = ingredients.filter(i => i.status === 'out').length;
  const totalValue = ingredients.reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0);

  const saveIngredient = async () => {
    if (!editItem?.name) return;
    const status = (editItem.current_stock || 0) <= 0 ? 'out' : (editItem.current_stock || 0) <= (editItem.min_level || 5) ? 'low' : 'normal';
    if (editItem.id) {
      await db.ingredients.update(editItem.id, { ...editItem, status });
    } else {
      await db.ingredients.add({ ...editItem as any, status, last_restocked: new Date() });
    }
    setEditItem(null);
    toast.success('Ingredient saved');
  };

  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          toast.error('The selected file is empty');
          return;
        }

        const ingredientsToImport: Omit<Ingredient, 'id'>[] = rows.map(row => {
          const name = row.Name || row.name || row.Item || '';
          const category = (row.Category || row.category || 'other').toLowerCase();
          const unit = row.Unit || row.unit || 'kg';
          const current_stock = Number(row.Stock || row.stock || row['Current Stock'] || 0);
          const min_level = Number(row.Min || row.min || row['Min Level'] || 5);
          const cost_per_unit = Number(row.Cost || row.cost || row['Price'] || 0);
          
          const status = current_stock <= 0 ? 'out' : current_stock <= min_level ? 'low' : 'normal';

          return {
            name,
            category,
            unit,
            current_stock,
            min_level,
            cost_per_unit,
            status,
            last_restocked: new Date()
          };
        }).filter(i => i.name);

        if (ingredientsToImport.length > 0) {
          await db.ingredients.bulkAdd(ingredientsToImport as any);
          toast.success(`Successfully imported ${ingredientsToImport.length} items`);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      toast.error('Failed to import Excel file. Please check the format.');
    }
  };

  // Chart data
  const chartData = categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: ingredients.filter(i => i.category === cat).reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{ingredients.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Stock Value</p><p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p></CardContent></Card>
        <Card className={lowStock > 0 ? "border-warning/30" : ""}><CardContent className="p-3"><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-warning">{lowStock}</p></CardContent></Card>
        <Card className={outStock > 0 ? "border-destructive/30" : ""}><CardContent className="p-3"><p className="text-xs text-muted-foreground">Out of Stock</p><p className="text-2xl font-bold text-destructive">{outStock}</p></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ingredients..." className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1 border-dashed hover:border-orange-500 hover:bg-orange-50">
          <Upload className="h-4 w-4" /> Import
        </Button>
        <Button variant="outline" onClick={() => exportToExcel(ingredients, 'Inventory_Report')} className="gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button onClick={() => setEditItem({ name: '', category: 'other', unit: 'kg', current_stock: 0, min_level: 5, cost_per_unit: 0, status: 'normal' })} className="gap-1 shadow-md shadow-orange-500/10">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {filtered.map(item => (
          <Card key={item.id} className={cn("hover:shadow-md transition-shadow",
            item.status === 'out' && "border-destructive/30 bg-destructive/5",
            item.status === 'low' && "border-warning/30 bg-warning/5",
          )}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center",
                  item.status === 'normal' ? "bg-success/10" : item.status === 'low' ? "bg-warning/10" : "bg-destructive/10"
                )}>
                  {item.status === 'normal' ? <Leaf className="h-5 w-5 text-success" /> :
                   item.status === 'low' ? <TrendingDown className="h-5 w-5 text-warning" /> :
                   <AlertTriangle className="h-5 w-5 text-destructive" />}
                </div>
                <div>
                  <span className="font-medium text-foreground text-sm">{item.name}</span>
                  <div className="text-xs text-muted-foreground">{item.category} • ₹{item.cost_per_unit}/{item.unit}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-foreground">{item.current_stock} {item.unit}</div>
                  <div className="text-[10px] text-muted-foreground">Min: {item.min_level}</div>
                </div>
                <Badge variant={item.status === 'normal' ? 'outline' : item.status === 'low' ? 'secondary' : 'destructive'} className="text-[10px]">
                  {item.status.toUpperCase()}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditItem(item)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => { db.ingredients.delete(item.id!); toast.success('Deleted'); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? 'Edit' : 'Add'} Ingredient</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Name *</Label><Input value={editItem?.name || ''} onChange={e => setEditItem(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={editItem?.category} onValueChange={v => setEditItem(f => f ? ({ ...f, category: v }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Current Stock</Label><Input type="number" value={editItem?.current_stock || ''} onChange={e => setEditItem(f => f ? ({ ...f, current_stock: Number(e.target.value) }) : null)} /></div>
              <div className="space-y-1"><Label>Min Level</Label><Input type="number" value={editItem?.min_level || ''} onChange={e => setEditItem(f => f ? ({ ...f, min_level: Number(e.target.value) }) : null)} /></div>
              <div className="space-y-1"><Label>Unit</Label>
                <Select value={editItem?.unit} onValueChange={v => setEditItem(f => f ? ({ ...f, unit: v }) : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem><SelectItem value="g">Grams</SelectItem>
                    <SelectItem value="L">Litres</SelectItem><SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pcs">Pieces</SelectItem><SelectItem value="dozen">Dozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Cost per Unit (₹)</Label><Input type="number" value={editItem?.cost_per_unit || ''} onChange={e => setEditItem(f => f ? ({ ...f, cost_per_unit: Number(e.target.value) }) : null)} /></div>
          </div>
          <DialogFooter><Button onClick={saveIngredient}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorView() {
  const vendors = useLiveQuery(() => db.vendors.toArray()) || [];
  const [editVendor, setEditVendor] = useState<Partial<Vendor> | null>(null);

  const saveVendor = async () => {
    if (!editVendor?.name) return;
    if (editVendor.id) {
      await db.vendors.update(editVendor.id, editVendor);
    } else {
      await db.vendors.add({ ...editVendor as any, outstanding_amount: 0, is_active: true });
    }
    setEditVendor(null);
    toast.success('Vendor saved');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">{vendors.length} vendors</p>
        <Button size="sm" onClick={() => setEditVendor({ name: '', contact_person: '', phone: '', category: '', outstanding_amount: 0, is_active: true })} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {vendors.map(v => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.category} • {v.contact_person}</p>
                </div>
                <Badge variant={v.is_active ? "outline" : "secondary"} className="text-[10px]">
                  {v.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>📞 {v.phone}</span>
                <span className={v.outstanding_amount > 0 ? "font-bold text-destructive" : "text-success"}>
                  Outstanding: ₹{v.outstanding_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => setEditVendor(v)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => { db.vendors.delete(v.id!); toast.success('Deleted'); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editVendor} onOpenChange={() => setEditVendor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editVendor?.id ? 'Edit' : 'Add'} Vendor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Company Name *</Label><Input value={editVendor?.name || ''} onChange={e => setEditVendor(f => f ? ({ ...f, name: e.target.value }) : null)} /></div>
              <div className="space-y-1"><Label>Contact Person</Label><Input value={editVendor?.contact_person || ''} onChange={e => setEditVendor(f => f ? ({ ...f, contact_person: e.target.value }) : null)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Phone</Label><Input value={editVendor?.phone || ''} onChange={e => setEditVendor(f => f ? ({ ...f, phone: e.target.value }) : null)} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={editVendor?.category || ''} onChange={e => setEditVendor(f => f ? ({ ...f, category: e.target.value }) : null)} placeholder="Vegetables, Meat, etc" /></div>
            </div>
            <div className="space-y-1"><Label>Email</Label><Input value={editVendor?.email || ''} onChange={e => setEditVendor(f => f ? ({ ...f, email: e.target.value }) : null)} /></div>
            <div className="space-y-1"><Label>GSTIN</Label><Input value={editVendor?.gstin || ''} onChange={e => setEditVendor(f => f ? ({ ...f, gstin: e.target.value }) : null)} /></div>
          </div>
          <DialogFooter><Button onClick={saveVendor}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PurchaseView() {
  const purchaseOrders = useLiveQuery(() => db.purchaseOrders.orderBy('created_at').reverse().toArray()) || [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {purchaseOrders.length} purchase orders
      </p>
      {purchaseOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowDownCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No purchase orders yet</p>
          <p className="text-xs">Create purchase orders from inventory to track supplier deliveries</p>
        </div>
      ) : (
        <div className="space-y-2">
          {purchaseOrders.map(po => (
            <Card key={po.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm">{po.po_number}</span>
                  <span className="text-xs text-muted-foreground ml-2">{po.vendor_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">₹{po.total_amount.toLocaleString()}</span>
                  <Badge variant="outline" className="text-[10px]">{po.status.toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

