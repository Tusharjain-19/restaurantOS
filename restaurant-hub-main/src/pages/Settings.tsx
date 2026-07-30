import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useRestaurant,
  useTaxConfig,
  usePrinters,
  useMenuCategories,
  useMenuItems,
  useUpdateRestaurant,
  useUpsertTaxConfig,
  useSavePrinter,
  useDeletePrinter,
  useSaveCategory,
  useDeleteCategory,
  useSaveMenuItem,
  useDeleteMenuItem,
} from '@/hooks/useRestaurantData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Printer, Pencil, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function Settings() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;

  const { data: restaurant, isLoading: loadingRest } = useRestaurant(restaurantId);
  const { data: taxConfig, isLoading: loadingTax } = useTaxConfig(restaurantId);
  const { data: printers, isLoading: loadingPrinters } = usePrinters(restaurantId);
  const { data: categories, isLoading: loadingCats } = useMenuCategories(restaurantId);
  const { data: items, isLoading: loadingItems } = useMenuItems(restaurantId);

  const updateRestMut = useUpdateRestaurant();
  const upsertTaxMut = useUpsertTaxConfig();
  const savePrinterMut = useSavePrinter();
  const deletePrinterMut = useDeletePrinter();
  const saveCategoryMut = useSaveCategory();
  const deleteCategoryMut = useDeleteCategory();
  const saveMenuItemMut = useSaveMenuItem();
  const deleteMenuItemMut = useDeleteMenuItem();

  // 1. Profile State
  const [profileForm, setProfileForm] = useState<Record<string, any>>({});
  // 2. UPI State
  const [upiForm, setUpiForm] = useState({ upi_id: '', upi_name: '' });
  // 3. Tax State
  const [taxForm, setTaxForm] = useState<Record<string, any>>({});
  // 4. Printer States
  const [editingPrinter, setEditingPrinter] = useState<any>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  // 5. Menu Categories/Items States
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isItemOpen, setIsItemOpen] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setProfileForm({
        name: restaurant.name || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        instagram: restaurant.instagram || '',
        facebook: restaurant.facebook || '',
        address_1: restaurant.address_1 || '',
        address_2: restaurant.address_2 || '',
        city: restaurant.city || '',
        state: restaurant.state || '',
        pin: restaurant.pin || '',
        gstin: restaurant.gstin || '',
        fssai: restaurant.fssai || '',
        pan: restaurant.pan || '',
      });
      const settings = (restaurant.settings as any) || {};
      setUpiForm({
        upi_id: settings.upi_id || '',
        upi_name: settings.upi_name || '',
      });
    }
  }, [restaurant]);

  useEffect(() => {
    if (taxConfig) {
      setTaxForm({
        service_charge_enabled: !!taxConfig.service_charge_enabled,
        service_charge_pct: String(taxConfig.service_charge_pct || 0),
        packaging_charge: String(taxConfig.packaging_charge || 0),
        round_off: taxConfig.round_off || 'nearest',
      });
    }
  }, [taxConfig]);

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCat) {
      setSelectedCat(categories[0].id);
    }
  }, [categories, selectedCat]);

  if (loadingRest || loadingTax || loadingPrinters || loadingCats || loadingItems) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (!restaurantId) return;
    updateRestMut.mutate({ id: restaurantId, payload: profileForm });
  };

  const handleSaveUPI = () => {
    if (!restaurantId || !restaurant) return;
    const currentSettings = (restaurant.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      upi_id: upiForm.upi_id,
      upi_name: upiForm.upi_name,
    };
    updateRestMut.mutate({ id: restaurantId, payload: { settings: updatedSettings } });
  };

  const handleSaveTax = () => {
    if (!restaurantId) return;
    upsertTaxMut.mutate({
      restaurantId,
      payload: {
        service_charge_enabled: !!taxForm.service_charge_enabled,
        service_charge_pct: Number(taxForm.service_charge_pct),
        packaging_charge: Number(taxForm.packaging_charge),
        round_off: taxForm.round_off,
      },
    });
  };

  const openAddPrinter = () => {
    setEditingPrinter({
      name: '',
      type: 'Bill',
      connection: 'USB',
      ipAddress: '',
      paperWidth: '80mm',
      isDefault: false,
      hasCashDrawer: false,
    });
    setIsPrinterOpen(true);
  };

  const handleSavePrinter = () => {
    if (!restaurantId || !editingPrinter) return;
    savePrinterMut.mutate({
      id: editingPrinter.id,
      restaurantId,
      payload: editingPrinter,
    }, {
      onSuccess: () => setIsPrinterOpen(false)
    });
  };

  const openAddCategory = () => {
    setEditingCat({ name: '', type: 'both', is_active: true });
    setIsCatOpen(true);
  };

  const handleSaveCategory = () => {
    if (!restaurantId || !editingCat) return;
    saveCategoryMut.mutate({
      id: editingCat.id,
      restaurantId,
      payload: editingCat,
    }, {
      onSuccess: () => setIsCatOpen(false)
    });
  };

  const openAddItem = () => {
    setEditingItem({
      category_id: selectedCat,
      name: '',
      price: '',
      item_type: 'Veg',
      is_available: true,
      description: '',
    });
    setIsItemOpen(true);
  };

  const handleSaveItem = () => {
    if (!restaurantId || !editingItem) return;
    saveMenuItemMut.mutate({
      id: editingItem.id,
      restaurantId,
      payload: editingItem,
    }, {
      onSuccess: () => setIsItemOpen(false)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your restaurant preferences, taxes, printers, and menu items.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-6">
          <TabsTrigger value="profile" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 rounded-lg">Profile Details</TabsTrigger>
          <TabsTrigger value="upi" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 rounded-lg">UPI Setup</TabsTrigger>
          <TabsTrigger value="tax" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 rounded-lg">Taxes & Service</TabsTrigger>
          <TabsTrigger value="printers" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 rounded-lg">Printers</TabsTrigger>
          <TabsTrigger value="menu" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 rounded-lg">Menu Setup</TabsTrigger>
        </TabsList>

        {/* 1. PROFILE DETAILS */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>Update your general restaurant metadata and legal registrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Restaurant Name *</Label>
                  <Input value={profileForm.name ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={profileForm.phone ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={profileForm.email ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={profileForm.website ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input value={profileForm.address_1 ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, address_1: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input value={profileForm.address_2 ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, address_2: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={profileForm.city ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>PIN Code</Label>
                    <Input value={profileForm.pin ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, pin: e.target.value }))} maxLength={6} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={profileForm.state ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input value={profileForm.gstin ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} maxLength={15} />
                </div>
                <div className="space-y-2">
                  <Label>FSSAI License</Label>
                  <Input value={profileForm.fssai ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, fssai: e.target.value }))} maxLength={14} />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input value={profileForm.pan ?? ''} onChange={(e) => setProfileForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))} maxLength={10} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={updateRestMut.isPending}>
                {updateRestMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 2. UPI SETUP */}
        <TabsContent value="upi">
          <Card>
            <CardHeader>
              <CardTitle>UPI QR Payments Setup</CardTitle>
              <CardDescription>Configure your merchant UPI address to dynamically show payment QR codes during checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Merchant UPI ID (VPA) *</Label>
                <Input placeholder="merchant@upi" value={upiForm.upi_id} onChange={(e) => setUpiForm(p => ({ ...p, upi_id: e.target.value }))} />
                <p className="text-xs text-muted-foreground">The actual address payments will be deposited to (e.g. name@okhdfcbank).</p>
              </div>
              <div className="space-y-2">
                <Label>Merchant Name *</Label>
                <Input placeholder="Ninja Cafe" value={upiForm.upi_name} onChange={(e) => setUpiForm(p => ({ ...p, upi_name: e.target.value }))} />
                <p className="text-xs text-muted-foreground">The display name customer will see in their UPI app.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveUPI} disabled={updateRestMut.isPending}>
                {updateRestMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save UPI Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 3. TAXES & SERVICE CHARGES */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Taxes & Charges</CardTitle>
              <CardDescription>Setup default parameters for GST slabs, service charge rules, and bill round-offs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Enable Service Charge</Label>
                  <p className="text-xs text-muted-foreground">Apply service charge as a percentage of order subtotal.</p>
                </div>
                <Switch
                  checked={!!taxForm.service_charge_enabled}
                  onCheckedChange={(val) => setTaxForm(p => ({ ...p, service_charge_enabled: val }))}
                />
              </div>

              {taxForm.service_charge_enabled && (
                <div className="space-y-2">
                  <Label>Service Charge %</Label>
                  <Input type="number" value={taxForm.service_charge_pct ?? '0'} onChange={(e) => setTaxForm(p => ({ ...p, service_charge_pct: e.target.value }))} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Packaging Charge (₹)</Label>
                <Input type="number" value={taxForm.packaging_charge ?? '0'} onChange={(e) => setTaxForm(p => ({ ...p, packaging_charge: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Invoice Round-off Method</Label>
                <Select value={taxForm.round_off} onValueChange={(val) => setTaxForm(p => ({ ...p, round_off: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest">Nearest Rupee (Standard)</SelectItem>
                    <SelectItem value="fifty">Nearest 50 Paise</SelectItem>
                    <SelectItem value="none">Disable Round-off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTax} disabled={upsertTaxMut.isPending}>
                {upsertTaxMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Tax Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 4. PRINTER NETWORKS */}
        <TabsContent value="printers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Printers</CardTitle>
                <CardDescription>Register thermal billing and Kitchen Order Ticket (KOT) printers.</CardDescription>
              </div>
              <Button size="sm" onClick={openAddPrinter}><Plus className="h-4 w-4 mr-1" /> Add Printer</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {(printers || []).map((printer: any) => (
                  <div key={printer.id} className="flex items-center justify-between rounded-lg border p-4 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-muted">
                        <Printer className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {printer.name}
                          {printer.isDefault && <Badge className="bg-success/10 text-success text-[10px]" variant="outline">Default</Badge>}
                          {printer.hasCashDrawer && <Badge className="bg-primary/10 text-primary text-[10px]" variant="outline">Drawer</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Type: {printer.type} | Conn: {printer.connection} {printer.connection === 'LAN' && `(${printer.ipAddress})`} | Width: {printer.paperWidth}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPrinter(printer); setIsPrinterOpen(true); }}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        if (confirm('Are you sure you want to delete this printer?')) {
                          deletePrinterMut.mutate({ id: printer.id, restaurantId: restaurantId! });
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!printers || printers.length === 0) && (
                  <p className="text-center text-sm text-muted-foreground py-8">No printers configured yet. Click "Add Printer" to start.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. MENU SETUP */}
        <TabsContent value="menu">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Categories column */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">Categories</CardTitle>
                </div>
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={openAddCategory}><Plus className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-2 mt-2">
                {(categories || []).map((cat: any) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                      selectedCat === cat.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCat(cat.id)}
                  >
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingCat(cat); setIsCatOpen(true); }}>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deleting this category will delete all its menu items! Proceed?')) {
                          deleteCategoryMut.mutate({ id: cat.id, restaurantId: restaurantId! });
                        }
                      }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Menu Items column */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">Menu Items</CardTitle>
                </div>
                <Button size="sm" onClick={openAddItem} disabled={!selectedCat}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
              </CardHeader>
              <CardContent className="space-y-3 mt-2">
                {(items || [])
                  .filter((item: any) => item.category_id === selectedCat)
                  .map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-all">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {item.name}
                          <Badge className={`text-[10px] ${item.item_type === 'veg' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`} variant="outline">
                            {item.item_type}
                          </Badge>
                          {!item.is_available && <Badge className="text-[10px] bg-muted-foreground/10 text-muted-foreground" variant="outline">Out of Stock</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm">₹{item.price}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(item); setIsItemOpen(true); }}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            if (confirm('Delete this menu item?')) {
                              deleteMenuItemMut.mutate({ id: item.id, restaurantId: restaurantId! });
                            }
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {(!items || items.filter((item: any) => item.category_id === selectedCat).length === 0) && (
                  <p className="text-center text-sm text-muted-foreground py-8">No items in this category yet. Click "Add Item" to start.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ════════════ DIALOGS ════════════ */}

      {/* Printer Dialog */}
      <Dialog open={isPrinterOpen} onOpenChange={setIsPrinterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPrinter?.id ? 'Edit Printer' : 'Add New Printer'}</DialogTitle>
            <DialogDescription>Specify printer name, type, connection, and properties.</DialogDescription>
          </DialogHeader>
          {editingPrinter && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Printer Name</Label>
                <Input value={editingPrinter.name} onChange={(e) => setEditingPrinter((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Printer Type</Label>
                  <Select value={editingPrinter.type} onValueChange={(val) => setEditingPrinter((p: any) => ({ ...p, type: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bill">Bill Printer</SelectItem>
                      <SelectItem value="KOT">KOT Printer</SelectItem>
                      <SelectItem value="Bar">Bar Printer</SelectItem>
                      <SelectItem value="Label">Label Printer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Connection Type</Label>
                  <Select value={editingPrinter.connection} onValueChange={(val) => setEditingPrinter((p: any) => ({ ...p, connection: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USB">USB</SelectItem>
                      <SelectItem value="LAN">LAN (Ethernet/WiFi)</SelectItem>
                      <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingPrinter.connection === 'LAN' && (
                <div className="space-y-1">
                  <Label>IP Address</Label>
                  <Input placeholder="192.168.1.100" value={editingPrinter.ipAddress} onChange={(e) => setEditingPrinter((p: any) => ({ ...p, ipAddress: e.target.value }))} />
                </div>
              )}

              <div className="space-y-1">
                <Label>Paper Width</Label>
                <Select value={editingPrinter.paperWidth} onValueChange={(val) => setEditingPrinter((p: any) => ({ ...p, paperWidth: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80mm">80mm thermal paper</SelectItem>
                    <SelectItem value="57mm">57mm thermal paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Default Printer</Label>
                  <p className="text-[10px] text-muted-foreground">Make this the fallback device for its type.</p>
                </div>
                <Switch checked={editingPrinter.isDefault} onCheckedChange={(val) => setEditingPrinter((p: any) => ({ ...p, isDefault: val }))} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Cash Drawer Connected</Label>
                  <p className="text-[10px] text-muted-foreground">Trigger pulse signal to open drawer on print.</p>
                </div>
                <Switch checked={editingPrinter.hasCashDrawer} onCheckedChange={(val) => setEditingPrinter((p: any) => ({ ...p, hasCashDrawer: val }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrinterOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePrinter} disabled={savePrinterMut.isPending}>
              {savePrinterMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Printer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingCat?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>Specify the category name and properties.</DialogDescription>
          </DialogHeader>
          {editingCat && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Category Name</Label>
                <Input value={editingCat.name} onChange={(e) => setEditingCat((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Serve Type</Label>
                <Select value={editingCat.type} onValueChange={(val) => setEditingCat((p: any) => ({ ...p, type: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Veg & Non-Veg (Both)</SelectItem>
                    <SelectItem value="veg">Vegetarian Only</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={saveCategoryMut.isPending}>
              {saveCategoryMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>Create or update a dish in this category.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Item Name</Label>
                <Input value={editingItem.name} onChange={(e) => setEditingItem((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={editingItem.price} onChange={(e) => setEditingItem((p: any) => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Diet Type</Label>
                  <Select value={editingItem.item_type} onValueChange={(val) => setEditingItem((p: any) => ({ ...p, item_type: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veg">Veg</SelectItem>
                      <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                      <SelectItem value="Egg">Egg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={editingItem.description} onChange={(e) => setEditingItem((p: any) => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Available (In Stock)</Label>
                  <p className="text-[10px] text-muted-foreground">Toggle off to mark item out of stock in POS.</p>
                </div>
                <Switch checked={editingItem.is_available} onCheckedChange={(val) => setEditingItem((p: any) => ({ ...p, is_available: val }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={saveMenuItemMut.isPending}>
              {saveMenuItemMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
