import { useState, useEffect } from 'react';
import { Shield, Key, Building2, Calendar, CheckCircle2, Copy, AlertCircle, RefreshCw, LogOut, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface License {
  id: string;
  license_key: string;
  restaurant_name: string;
  admin_username: string;
  admin_password?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export default function SuperAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hqPassword, setHqPassword] = useState('');
  
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    restaurant_name: '',
    admin_username: 'Admin',
    admin_password: 'admin123',
    validity_months: 12
  });

  const checkDbSetup = async () => {
    // Ping supabase to see if licenses table exists
    const { error } = await supabase.from('licenses').select('id').limit(1);
    if (error && error.code === '42P01') {
      toast.error('Supabase "licenses" table is missing! Please create it via Supabase SQL Editor.', { duration: 10000 });
      console.error(error);
    }
  };

  const fetchLicenses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load licenses: ' + error.message);
    } else {
      setLicenses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkDbSetup();
      fetchLicenses();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Master company password - hardcoded for security as requested
    if (hqPassword === 'admin@company2025') {
      setIsAuthenticated(true);
      toast.success('Welcome to Company HQ');
    } else {
      toast.error('Invalid HQ Password');
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) key += '-';
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const createLicense = async () => {
    if (!formData.restaurant_name || !formData.admin_username || !formData.admin_password) {
      toast.error('All fields are required');
      return;
    }
    
    setLoading(true);
    const key = generateKey();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + formData.validity_months);

    const { error } = await supabase.from('licenses').insert([{
      license_key: key,
      restaurant_name: formData.restaurant_name,
      admin_username: formData.admin_username,
      admin_password: formData.admin_password,
      is_active: true,
      expires_at: expiry.toISOString()
    }]);

    if (error) {
      toast.error('Failed to create license: ' + error.message);
    } else {
      toast.success('License generated successfully!');
      setShowAdd(false);
      setFormData({ restaurant_name: '', admin_username: 'Admin', admin_password: 'admin123', validity_months: 12 });
      fetchLicenses();
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('licenses').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`License ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchLicenses();
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this license?')) return;
    const { error } = await supabase.from('licenses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete license');
    } else {
      toast.success('License deleted');
      fetchLicenses();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-gray-800 bg-gray-900 text-white">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-xl">Company HQ Login</CardTitle>
            <CardDescription className="text-gray-400">Master access for software distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hq_password">Master Password</Label>
                <Input 
                  id="hq_password"
                  type="password" 
                  value={hqPassword} 
                  onChange={e => setHqPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus-visible:ring-blue-500"
                  placeholder="Enter HQ Password"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Access Console</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">License Management HQ</h1>
              <p className="text-sm text-gray-500">Manage client restaurant installations & credentials</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchLicenses}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" /> Issue New License</Button>
            <Button variant="ghost" onClick={() => setIsAuthenticated(false)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Database instruction banner */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold mb-1">Supabase Database Setup Required</p>
            <p>Ensure your Supabase project has a table named <code>licenses</code> with columns: <code>id</code> (uuid), <code>license_key</code> (text), <code>restaurant_name</code> (text), <code>admin_username</code> (text), <code>admin_password</code> (text), <code>is_active</code> (bool), <code>expires_at</code> (timestamptz).</p>
          </div>
        </div>

        {/* Licenses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {licenses.map(lic => {
            const isExpired = new Date(lic.expires_at) < new Date();
            return (
              <Card key={lic.id} className={`border-2 ${!lic.is_active || isExpired ? 'border-gray-200 opacity-75' : 'border-blue-100'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{lic.restaurant_name}</CardTitle>
                    <Badge variant={lic.is_active && !isExpired ? 'default' : 'destructive'} className={lic.is_active && !isExpired ? 'bg-green-500' : ''}>
                      {isExpired ? 'Expired' : lic.is_active ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 font-mono text-sm relative group">
                    <div className="text-slate-500 text-xs mb-1 font-sans font-medium">LICENSE KEY</div>
                    <div className="font-bold tracking-wider">{lic.license_key}</div>
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(lic.license_key)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 border rounded-md p-3">
                    <div>
                      <span className="text-gray-500 text-xs block">Admin User</span>
                      <span className="font-semibold">{lic.admin_username}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Admin Pass</span>
                      <span className="font-mono">{lic.admin_password}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" /> Valid until: {new Date(lic.expires_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toggleStatus(lic.id, lic.is_active)}>
                      {lic.is_active ? 'Revoke Access' : 'Restore Access'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteLicense(lic.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {licenses.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">No licenses issued yet.</p>
              <p className="text-sm">Click "Issue New License" to onboard a restaurant.</p>
            </div>
          )}
        </div>

        {/* Issue License Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Issue New Software License</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client Restaurant Name</Label>
                <Input value={formData.restaurant_name} onChange={e => setFormData({...formData, restaurant_name: e.target.value})} placeholder="e.g. Spice Route" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Master Username</Label>
                  <Input value={formData.admin_username} onChange={e => setFormData({...formData, admin_username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Master Password</Label>
                  <Input value={formData.admin_password} onChange={e => setFormData({...formData, admin_password: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>License Validity (Months)</Label>
                <Input type="number" min="1" max="120" value={formData.validity_months} onChange={e => setFormData({...formData, validity_months: parseInt(e.target.value)})} />
              </div>
              
              <div className="bg-amber-50 text-amber-800 p-3 rounded text-xs leading-relaxed border border-amber-200">
                This will generate a secure license key. The client must enter the key on their local software installation to unlock it.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={createLicense} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                Generate License
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
