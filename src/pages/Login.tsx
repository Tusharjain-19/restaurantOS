import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UtensilsCrossed, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithPin } = useAuth();

  useEffect(() => {
    if (localStorage.getItem('ros_activated') !== 'true') {
      navigate('/activation', { replace: true });
    }
  }, [navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (loginMode === 'pin') {
      if (!pin || pin.length < 4) {
        setError('Please enter a valid 4-digit PIN');
        setLoading(false);
        return;
      }
      const result = await signInWithPin(pin);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/dashboard');
      }
    } else {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const result = await signIn(email, password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(215,60%,12%)] via-[hsl(215,50%,18%)] to-[hsl(215,40%,8%)] p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-8 shadow-2xl shadow-black/20">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 shadow-lg shadow-accent/30">
                <UtensilsCrossed className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-[hsl(215,50%,18%)] animate-pulse" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">RestaurantOS</h1>
              <p className="text-sm text-white/50 mt-1">Restaurant Management System</p>
            </div>
          </div>

          {/* Login mode toggle */}
          <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setLoginMode('password')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMode === 'password'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => setLoginMode('pin')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'pin'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" /> Quick PIN
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loginMode === 'password' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wider">Username / Email / Phone</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70 text-xs uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(v) => setRemember(!!v)}
                      className="border-white/20"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-white/50">Remember me</Label>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="pin" className="text-white/70 text-xs uppercase tracking-wider">Enter 4-Digit PIN</Label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                        pin[i]
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/20'
                      }`}
                    >
                      {pin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="opacity-0 absolute"
                  autoFocus
                />
                <p className="text-center text-xs text-white/30">Default PIN: 1234</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-orange-600 text-white hover:from-accent/90 hover:to-orange-600/90 h-12 rounded-xl text-base font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loginMode === 'pin' ? 'Unlock' : 'Sign In'}
            </Button>
          </form>

          {/* Offline indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Offline Mode — No Internet Required</span>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-[10px] text-white/20 mt-4">RestaurantOS v1.0 • Production Ready</p>
      </div>
    </div>
  );
}
