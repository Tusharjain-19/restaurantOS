import { useState } from 'react';
import { Plus, Search, Download, Upload, AlertTriangle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MOCK_INGREDIENTS, MOCK_VENDORS } from '@/lib/mock-data';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredIngredients = MOCK_INGREDIENTS
    .filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter);

  const lowStockCount = MOCK_INGREDIENTS.filter(i => i.status === 'low' || i.status === 'out').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        {lowStockCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {lowStockCount} items need attention
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Ingredients</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="wastage">Wastage</TabsTrigger>
        </TabsList>

        {/* INGREDIENTS TAB */}
        <TabsContent value="items" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ingredients..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="meat">Meat</SelectItem>
                <SelectItem value="grains">Grains</SelectItem>
                <SelectItem value="spices">Spices</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1" /> Import CSV</Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Level</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map(item => (
                  <TableRow key={item.id} className={cn(
                    item.status === 'low' && "bg-warning/5",
                    item.status === 'out' && "bg-destructive/5",
                  )}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{item.category}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right font-mono">{item.current_stock}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{item.min_level}</TableCell>
                    <TableCell className="text-right font-mono">₹{item.cost_per_unit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]",
                        item.status === 'normal' && "text-success border-success",
                        item.status === 'low' && "text-warning border-warning",
                        item.status === 'out' && "text-destructive border-destructive",
                      )}>
                        {item.status === 'out' ? 'Out of Stock' : item.status === 'low' ? 'Low Stock' : 'Normal'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* RECIPES TAB */}
        <TabsContent value="recipes" className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Select Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Search menu items..." className="mb-3" />
                <div className="space-y-1">
                  {['Paneer Tikka', 'Butter Chicken', 'Dal Tadka', 'Chicken Biryani'].map(item => (
                    <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recipe — Paneer Tikka</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Paneer</TableCell><TableCell className="text-right">250g</TableCell><TableCell className="text-right">₹80</TableCell></TableRow>
                    <TableRow><TableCell>Bell Pepper</TableCell><TableCell className="text-right">100g</TableCell><TableCell className="text-right">₹15</TableCell></TableRow>
                    <TableRow><TableCell>Yogurt</TableCell><TableCell className="text-right">50ml</TableCell><TableCell className="text-right">₹10</TableCell></TableRow>
                    <TableRow><TableCell>Spices Mix</TableCell><TableCell className="text-right">20g</TableCell><TableCell className="text-right">₹8</TableCell></TableRow>
                  </TableBody>
                </Table>
                <div className="mt-3 p-3 rounded-lg bg-muted text-xs grid grid-cols-3 gap-2">
                  <div><span className="text-muted-foreground">Food Cost</span><br /><span className="font-bold text-foreground">₹113</span></div>
                  <div><span className="text-muted-foreground">Selling Price</span><br /><span className="font-bold text-foreground">₹280</span></div>
                  <div><span className="text-muted-foreground">Cost %</span><br /><span className="font-bold text-success">40.4%</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* STOCK TAB */}
        <TabsContent value="stock" className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Items</div><div className="text-2xl font-bold text-foreground">{MOCK_INGREDIENTS.length}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Low Stock</div><div className="text-2xl font-bold text-warning">{MOCK_INGREDIENTS.filter(i => i.status === 'low').length}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Out of Stock</div><div className="text-2xl font-bold text-destructive">{MOCK_INGREDIENTS.filter(i => i.status === 'out').length}</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Manual Stock Adjustment</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Ingredient</label>
                  <Select><SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_INGREDIENTS.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted-foreground">Qty (+/-)</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Reason</label>
                  <Input placeholder="Reason for adjustment" />
                </div>
                <Button size="sm">Adjust</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PURCHASES TAB */}
        <TabsContent value="purchases" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Purchase Orders</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create PO</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PO-001</TableCell>
                  <TableCell>Fresh Farm Supplies</TableCell>
                  <TableCell className="text-muted-foreground">08 Apr 26</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell className="text-right">₹8,450</TableCell>
                  <TableCell><Badge variant="outline" className="text-success border-success text-[10px]">Received</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">PO-002</TableCell>
                  <TableCell>Delhi Meat House</TableCell>
                  <TableCell className="text-muted-foreground">09 Apr 26</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell className="text-right">₹15,200</TableCell>
                  <TableCell><Badge variant="outline" className="text-accent border-accent text-[10px]">Sent</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">PO-003</TableCell>
                  <TableCell>Amul Distributors</TableCell>
                  <TableCell className="text-muted-foreground">09 Apr 26</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell className="text-right">₹6,800</TableCell>
                  <TableCell><Badge variant="outline" className="text-muted-foreground text-[10px]">Draft</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* VENDORS TAB */}
        <TabsContent value="vendors" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Suppliers</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_VENDORS.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell className="text-muted-foreground">{v.contact}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{v.category}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{v.last_order}</TableCell>
                    <TableCell className="text-right font-mono">
                      {v.outstanding > 0 ? <span className="text-destructive">₹{v.outstanding.toLocaleString()}</span> : <span className="text-success">₹0</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* WASTAGE TAB */}
        <TabsContent value="wastage" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Waste Tracking</h3>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Record Wastage</Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Today's Wastage</div><div className="text-2xl font-bold text-destructive">₹1,240</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">This Week</div><div className="text-2xl font-bold text-warning">₹5,680</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">This Month</div><div className="text-2xl font-bold text-foreground">₹18,450</div></CardContent></Card>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>09 Apr</TableCell><TableCell>Tomatoes</TableCell><TableCell>2 kg</TableCell><TableCell><Badge variant="outline" className="text-[10px]">Spoiled</Badge></TableCell><TableCell className="text-right text-destructive">₹80</TableCell></TableRow>
                <TableRow><TableCell>09 Apr</TableCell><TableCell>Paneer Tikka</TableCell><TableCell>1 plate</TableCell><TableCell><Badge variant="outline" className="text-[10px]">Dropped</Badge></TableCell><TableCell className="text-right text-destructive">₹280</TableCell></TableRow>
                <TableRow><TableCell>09 Apr</TableCell><TableCell>Chicken</TableCell><TableCell>1.5 kg</TableCell><TableCell><Badge variant="outline" className="text-[10px]">Expired</Badge></TableCell><TableCell className="text-right text-destructive">₹330</TableCell></TableRow>
                <TableRow><TableCell>08 Apr</TableCell><TableCell>Cream</TableCell><TableCell>0.5 L</TableCell><TableCell><Badge variant="outline" className="text-[10px]">Spoiled</Badge></TableCell><TableCell className="text-right text-destructive">₹100</TableCell></TableRow>
                <TableRow><TableCell>08 Apr</TableCell><TableCell>Butter Naan</TableCell><TableCell>5 pcs</TableCell><TableCell><Badge variant="outline" className="text-[10px]">Over-prepared</Badge></TableCell><TableCell className="text-right text-destructive">₹150</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
