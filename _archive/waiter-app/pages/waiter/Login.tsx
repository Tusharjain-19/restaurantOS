import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function WaiterLogin() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDigit = (d: string) => {
    if (pin.length >= 6) return;
    setPin(pin + d);
    setError('');
  };
  const handleDelete = () => { setPin(pin.slice(0, -1)); setError(''); };

  const submit = async () => {
    if (!staffId.trim() || pin.length < 4) {
      setError('Enter Staff ID and 4–6 digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Look up staff row by Staff ID + PIN
      const { data: staff, error: lookupErr } = await supabase
        .from('staff')
        .select('id, email, name, role, is_active, restaurant_id')
        .eq('staff_id', staffId.trim())
        .eq('pin', pin)
        .maybeSingle();

      if (lookupErr) throw lookupErr;
      if (!staff || !staff.is_active) {
        setError('Invalid Staff ID or PIN');
        setLoading(false);
        return;
      }
      if (!staff.email) {
        setError('This staff account has no email linked. Ask admin.');
        setLoading(false);
        return;
      }

      // Sign into Supabase Auth — convention: auth password equals the PIN
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: staff.email,
        password: pin,
      });

      if (signErr) {
        setError('Login failed — ask your admin to reset your PIN.');
        setLoading(false);
        return;
      }

      await supabase.from('staff').update({ last_login: new Date().toISOString() }).eq('id', staff.id);
      toast.success(`Welcome, ${staff.name}`);
      navigate('/waiter/home');
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-7 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">Waiter Sign In</h1>
          <p className="text-xs text-muted-foreground">Staff ID + PIN</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sid" className="text-xs">Staff ID</Label>
            <Input
              id="sid"
              autoFocus
              autoComplete="username"
              placeholder="e.g. W001"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value.toUpperCase())}
              className="h-11 text-base tracking-wider"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">PIN</Label>
            <div className="flex justify-center gap-2.5 py-2">
              {[0,1,2,3,4,5].map((i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full border-2 transition-colors ${
                    i < pin.length ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','⌫','0','OK'].map((k) => {
                const isAction = k === '⌫' || k === 'OK';
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={loading || (k === 'OK' && (pin.length < 4 || !staffId))}
                    onClick={() => {
                      if (k === '⌫') handleDelete();
                      else if (k === 'OK') submit();
                      else handleDigit(k);
                    }}
                    className={`h-12 rounded-lg text-lg font-semibold transition-colors disabled:opacity-40 ${
                      k === 'OK'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : isAction
                          ? 'bg-muted text-foreground hover:bg-muted/80'
                          : 'bg-secondary text-secondary-foreground hover:bg-muted active:bg-primary/10'
                    }`}
                  >
                    {k === 'OK' && loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : k}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Manager?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in with email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
