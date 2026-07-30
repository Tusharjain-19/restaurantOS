import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activationKey, setActivationKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !activationKey) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    // Format the email used for Supabase Authentication
    const authEmail = email.includes('@')
      ? email.trim()
      : `${email.trim().toLowerCase().replace(/\s+/g, '')}@restaurant.local`;

    // 1. Sign in with email and password
    const result = await signIn(authEmail, password);
    if (result.error) {
      setError('Invalid email/username or password. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // 2. Fetch session user to get their profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication session not found.');
      }

      // Check if this is the super admin email bypassing activation key checks
      const SUPER_ADMIN_EMAIL = 'admin@restaurantos.test';
      if (session.user.email === SUPER_ADMIN_EMAIL) {
        setLoading(false);
        navigate('/dashboard');
        return;
      }

      // 3. Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('restaurant_id, role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileErr) throw profileErr;
      if (!profile?.restaurant_id) {
        throw new Error('This user profile is not linked to any restaurant.');
      }

      // 4. Fetch license matching the restaurant_id
      const { data: license, error: licErr } = await supabase
        .from('licenses')
        .select('is_active, expires_at, license_key, admin_username')
        .eq('restaurant_id', profile.restaurant_id)
        .maybeSingle();

      if (licErr) throw licErr;
      if (!license) {
        throw new Error('No license configuration found for this restaurant.');
      }

      if (!license.is_active) {
        throw new Error('This restaurant account has been deactivated.');
      }

      if (new Date(license.expires_at) < new Date()) {
        throw new Error('This restaurant license has expired.');
      }

      if (license.license_key.trim().toUpperCase() !== activationKey.trim().toUpperCase()) {
        throw new Error('Incorrect activation key for this restaurant.');
      }

      if (license.admin_username.trim().toLowerCase() !== email.trim().toLowerCase()) {
        throw new Error('Incorrect email or username details.');
      }

      // Login successful!
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      // If validation fails, sign out immediately to clear credentials/session
      await supabase.auth.signOut();
      setError(err?.message ?? 'License verification failed.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl">
            R
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">RestaurantOS</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              placeholder="admin@restaurant.com or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activationKey">Activation Key</Label>
            <div className="relative">
              <Input
                id="activationKey"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                required
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <KeyRound className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
