import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, CheckCircle, Store, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export default function Activation() {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'success'>('input');

  // Check if already activated
  useEffect(() => {
    const isActivated = localStorage.getItem('ros_activated') === 'true';
    if (isActivated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setLoading(true);
    
    // Check Supabase for the license key
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey.trim())
        .single();
        
      if (error || !data) {
        toast.error('Invalid license key. Please contact support.');
        setLoading(false);
        return;
      }

      if (!data.is_active) {
        toast.error('This license has been deactivated. Contact support.');
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error('This license is expired. Please renew your subscription.');
        setLoading(false);
        return;
      }

      toast.success('License verified! Setting up system...');
      
      // Update local database with license details
      const restaurantCount = await db.restaurant.count();
      if (restaurantCount === 0) {
        await db.restaurant.add({
          name: data.restaurant_name,
          cuisine_type: 'Multi-Cuisine',
          restaurant_type: 'casual',
          address: '',
          city: '',
          state: '',
          pincode: '',
          phone: '',
          email: '',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        const profile = await db.restaurant.toCollection().first();
        if (profile?.id) {
            await db.restaurant.update(profile.id, { name: data.restaurant_name });
        }
      }

      // Ensure the master admin account matches what the reseller specified
      await db.staff.filter(s => s.role === 'admin').modify({ is_active: false }); // disable old admins
      await db.staff.add({
        name: data.admin_username,
        phone: '1234567890',
        role: 'admin',
        pin: '1234',
        password_hash: data.admin_password || 'admin123',
        is_active: true,
        shift: 'full',
        joining_date: new Date(),
        created_at: new Date(),
      });

      // Mark as activated locally
      localStorage.setItem('ros_activated', 'true');
      localStorage.setItem('ros_license_key', licenseKey);
      
      setStep('success');
    } catch (err) {
      console.error(err);
      toast.error('Connection failed. Please ensure you have internet access for initial activation.');
    } finally {
      setLoading(false);
    }
  };

  const finish = () => navigate('/login');

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden items-center justify-center p-4">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 text-white">
             <Store className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">RestaurantOS</h1>
          <p className="text-slate-400 mt-2">Offline Restaurant Management System</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 w-full" />
          {step === 'input' ? (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-white text-xl flex items-center justify-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-500" /> Software Activation
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your license key to activate the software for offline use.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleActivation} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-slate-300">License Key</Label>
                    <Input 
                      value={licenseKey} 
                      onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="bg-slate-950 border-slate-700 text-white text-center tracking-widest font-mono h-12 text-lg focus-visible:ring-amber-500"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 text-sm text-blue-200">
                    <Cpu className="h-5 w-5 shrink-0 text-blue-400" />
                    <p>Activation requires a one-time internet connection. After activation, the software runs 100% offline.</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg h-12 text-base font-semibold"
                    disabled={loading || licenseKey.length < 5}
                  >
                    {loading ? 'Verifying License...' : 'Activate Software'}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="p-8 text-center space-y-6">
               <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="h-10 w-10 text-green-500" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-2">Activation Successful!</h2>
                 <p className="text-slate-400 text-sm leading-relaxed">
                   Your restaurant database has been securely configured for local usage. You may now log in using the credentials provided by your distributor.
                 </p>
               </div>
               <Button onClick={finish} className="w-full h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold">
                 Proceed to Login
               </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
