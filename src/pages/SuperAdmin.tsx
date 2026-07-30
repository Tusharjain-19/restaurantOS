import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, LogOut, Eye, EyeOff, RefreshCw, Shield, Edit } from 'lucide-react';
import { format } from 'date-fns';

const SUPER_ADMIN_EMAIL = 'admin@restaurantos.test';

interface License {
  id: string;
  license_key: string;
  restaurant_name: string;
  admin_username: string;
  admin_password: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  client_email: string | null;
  client_mobile: string | null;
  subscription_plan: string | null;
  account_details: string | null;
}

function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = Array.from({ length: 4 }, () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  );
  return segments.join('-');
}

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    restaurant_name: '',
    admin_username: '',
    admin_password: '',
    expires_at: '',
    client_email: '',
    client_mobile: '',
    subscription_plan: 'Standard',
    account_details: '',
  });

  const [editForm, setEditForm] = useState<License | null>(null);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === SUPER_ADMIN_EMAIL) {
      setAuthed(true);
      fetchLicenses();
    }
    setLoading(false);
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const fetchLicenses = async () => {
    const { data } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
    if (data) setLicenses(data as unknown as License[]);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error('Invalid credentials'); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== SUPER_ADMIN_EMAIL) {
      await supabase.auth.signOut();
      toast.error('Access denied. Super admin only.');
      return;
    }
    setAuthed(true);
    fetchLicenses();
  };

  const createLicense = async () => {
    if (!form.restaurant_name || !form.admin_username || !form.admin_password || !form.expires_at) {
      toast.error('Fill all fields'); return;
    }
    const email = form.admin_username.trim();

    const { data, error } = await supabase.functions.invoke('admin-create-restaurant', {
      body: {
        restaurant_name: form.restaurant_name,
        admin_email: email,
        admin_password: form.admin_password,
        expires_at: new Date(form.expires_at).toISOString(),
        plan: form.subscription_plan,
        client_email: form.client_email || null,
        client_mobile: form.client_mobile || null,
        account_details: form.account_details || null,
      },
    });
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? 'Failed to create restaurant');
      return;
    }
    toast.success(`Restaurant created! License: ${(data as any).license_key}`);
    setDialogOpen(false);
    setForm({
      restaurant_name: '',
      admin_username: '',
      admin_password: '',
      expires_at: '',
      client_email: '',
      client_mobile: '',
      subscription_plan: 'Standard',
      account_details: '',
    });
    fetchLicenses();
  };

  const updateLicense = async () => {
    if (!editForm) return;
    const { error } = await supabase
      .from('licenses')
      .update({
        restaurant_name: editForm.restaurant_name,
        admin_username: editForm.admin_username,
        admin_password: editForm.admin_password,
        client_email: editForm.client_email || null,
        client_mobile: editForm.client_mobile || null,
        subscription_plan: editForm.subscription_plan,
        expires_at: editForm.expires_at,
        account_details: editForm.account_details || null,
      } as any)
      .eq('id', editForm.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Credentials and details updated successfully!');
      setEditDialogOpen(false);
      fetchLicenses();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { data: license } = await supabase
      .from('licenses')
      .update({ is_active: !current } as any)
      .eq('id', id)
      .select('restaurant_id')
      .maybeSingle();

    if (license?.restaurant_id) {
      await supabase
        .from('restaurants')
        .update({ is_active: !current } as any)
        .eq('id', license.restaurant_id);
    }

    toast.success(current ? 'License deactivated' : 'License activated');
    fetchLicenses();
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('Delete this license permanently?')) return;
    
    const { data: license } = await supabase
      .from('licenses')
      .select('restaurant_id')
      .eq('id', id)
      .maybeSingle();

    await supabase.from('licenses').delete().eq('id', id);

    if (license?.restaurant_id) {
      await supabase
        .from('restaurants')
        .update({ is_active: false } as any)
        .eq('id', license.restaurant_id);
    }

    toast.success('License deleted');
    fetchLicenses();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Super Admin Panel</CardTitle>
            <p className="text-sm text-muted-foreground">RestaurantOS License Management</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="admin@restaurantos.test" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RestaurantOS — Super Admin</h1>
            <p className="text-xs text-muted-foreground">License & Credential Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLicenses}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button variant="ghost" size="sm" onClick={() => { supabase.auth.signOut(); setAuthed(false); }}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Licenses ({licenses.length})</h2>
            <p className="text-sm text-muted-foreground">Manage restaurant subscriptions and credentials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 text-xs font-semibold"><Plus className="h-3.5 w-3.5 mr-1" /> New License</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-5 gap-3">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Create New Restaurant License</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-1 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Restaurant Name</Label>
                  <Input className="h-8 text-xs" value={form.restaurant_name} onChange={e => setForm(f => ({ ...f, restaurant_name: e.target.value }))} placeholder="Taj Kitchen" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Admin Login Username / Email</Label>
                    <Input className="h-8 text-xs" value={form.admin_username} onChange={e => setForm(f => ({ ...f, admin_username: e.target.value }))} placeholder="admin@tajkitchen.com or admin" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Admin Password</Label>
                    <Input className="h-8 text-xs" value={form.admin_password} onChange={e => setForm(f => ({ ...f, admin_password: e.target.value }))} placeholder="Strong password" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Client Contact Email</Label>
                    <Input type="email" className="h-8 text-xs" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="owner@gmail.com" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Client Mobile</Label>
                    <Input className="h-8 text-xs" value={form.client_mobile} onChange={e => setForm(f => ({ ...f, client_mobile: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Subscription Plan</Label>
                    <Select value={form.subscription_plan} onValueChange={v => setForm(f => ({ ...f, subscription_plan: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Trial (7 Days)', 'Starter', 'Standard', 'Premium'].map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">License Expires On</Label>
                    <Input type="date" className="h-8 text-xs" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Account Details / Notes</Label>
                  <textarea
                    value={form.account_details}
                    onChange={e => setForm(f => ({ ...f, account_details: e.target.value }))}
                    className="flex min-h-[50px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Billing notes, payment logs..."
                  />
                </div>
                <Button className="w-full h-8 text-xs font-semibold mt-1" onClick={createLicense}>Create License & Account</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md p-5 gap-3">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Edit Restaurant License & Credentials</DialogTitle>
              </DialogHeader>
              {editForm && (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Restaurant Name</Label>
                    <Input className="h-8 text-xs" value={editForm.restaurant_name} onChange={e => setEditForm(f => f ? ({ ...f, restaurant_name: e.target.value }) : null)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">Login Email / Username</Label>
                      <Input className="h-8 text-xs" value={editForm.admin_username} onChange={e => setEditForm(f => f ? ({ ...f, admin_username: e.target.value }) : null)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">Login Password</Label>
                      <Input className="h-8 text-xs" value={editForm.admin_password} onChange={e => setEditForm(f => f ? ({ ...f, admin_password: e.target.value }) : null)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">Client Email</Label>
                      <Input type="email" className="h-8 text-xs" value={editForm.client_email || ''} onChange={e => setEditForm(f => f ? ({ ...f, client_email: e.target.value }) : null)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">Client Mobile</Label>
                      <Input className="h-8 text-xs" value={editForm.client_mobile || ''} onChange={e => setEditForm(f => f ? ({ ...f, client_mobile: e.target.value }) : null)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">Subscription Plan</Label>
                      <Select value={editForm.subscription_plan || 'Standard'} onValueChange={v => setEditForm(f => f ? ({ ...f, subscription_plan: v }) : null)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Trial (7 Days)', 'Starter', 'Standard', 'Premium'].map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">License Expires On</Label>
                      <Input type="date" className="h-8 text-xs" value={editForm.expires_at ? editForm.expires_at.split('T')[0] : ''} onChange={e => setEditForm(f => f ? ({ ...f, expires_at: new Date(e.target.value).toISOString() }) : null)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Account Details / Notes</Label>
                    <textarea
                      value={editForm.account_details || ''}
                      onChange={e => setEditForm(f => f ? ({ ...f, account_details: e.target.value }) : null)}
                      className="flex min-h-[50px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <Button className="w-full h-8 text-xs font-semibold mt-1" onClick={updateLicense}>Save Changes</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {licenses.length === 0 && (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No licenses yet. Create one to get started.</CardContent></Card>
          )}
          {licenses.map(lic => (
            <Card key={lic.id} className={`border border-border shadow-sm transition-opacity ${!lic.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-foreground mr-1">{lic.restaurant_name}</span>
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-semibold">{lic.subscription_plan || 'Standard'}</span>
                    <Badge variant={lic.is_active ? 'default' : 'secondary'} className="text-[10px] py-0">{lic.is_active ? 'Active' : 'Inactive'}</Badge>
                    {new Date(lic.expires_at) < new Date() && <Badge variant="destructive" className="text-[10px] py-0">Expired</Badge>}
                  </div>
                  <div className="grid gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span>Key:</span>
                      <code className="bg-muted px-1 rounded font-mono text-[10px] text-foreground">{lic.license_key}</code>
                      <button onClick={() => copyToClipboard(lic.license_key, 'License key')} className="text-primary hover:opacity-80"><Copy className="h-3 w-3" /></button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Login:</span>
                      <code className="bg-muted px-1 rounded font-mono text-[10px] text-foreground">{lic.admin_username}</code>
                      <button onClick={() => copyToClipboard(lic.admin_username, 'Username')} className="text-primary hover:opacity-80"><Copy className="h-3 w-3" /></button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Pass:</span>
                      {showPasswords[lic.id] ? (
                        <>
                          <code className="bg-muted px-1 rounded font-mono text-[10px] text-foreground">{lic.admin_password}</code>
                          <button onClick={() => copyToClipboard(lic.admin_password, 'Password')} className="text-primary hover:opacity-80"><Copy className="h-3 w-3" /></button>
                        </>
                      ) : (
                        <code className="bg-muted px-1 rounded font-mono text-[10px] text-foreground">••••••••</code>
                      )}
                      <button onClick={() => setShowPasswords(s => ({ ...s, [lic.id]: !s[lic.id] }))} className="text-muted-foreground hover:text-foreground">
                        {showPasswords[lic.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                    {lic.client_email && (
                      <div className="flex items-center gap-1 col-span-1">
                        <span>Client Email:</span>
                        <span className="text-foreground font-medium">{lic.client_email}</span>
                      </div>
                    )}
                    {lic.client_mobile && (
                      <div className="flex items-center gap-1 col-span-1">
                        <span>Mobile:</span>
                        <span className="text-foreground font-medium">{lic.client_mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>Expires:</span>
                      <span className="text-foreground font-medium">{format(new Date(lic.expires_at), 'dd MMM yyyy')}</span>
                    </div>
                    {lic.account_details && (
                      <div className="col-span-full mt-1 bg-muted/30 p-2 rounded border border-border/40 text-[10px] text-muted-foreground">
                        <span className="font-semibold block text-[9px] uppercase tracking-wider text-muted-foreground/80 mb-0.5">Notes & Billing Details</span>
                        {lic.account_details}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setEditForm(lic); setEditDialogOpen(true); }}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant={lic.is_active ? 'outline' : 'default'} className="h-7 text-[11px]" onClick={() => toggleActive(lic.id, lic.is_active)}>
                    {lic.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => deleteLicense(lic.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
