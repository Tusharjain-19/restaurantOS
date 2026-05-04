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
  const { signIn, signInWithPin, signInWithGoogle } = useAuth();

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-zinc-950 font-sans">
      {/* Left Panel - Project Info */}
      <div className="hidden lg:flex w-1/2 bg-zinc-50 border-r border-zinc-200 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">RestaurantOS</span>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">About the Project</h2>
              <p className="text-zinc-600 leading-relaxed">
                RestaurantOS is a comprehensive, local-first restaurant management system. It's designed to handle everything from point-of-sale transactions and kitchen ticketing to inventory management and detailed analytics, all working seamlessly even offline.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">How HQ-Admin Works</h3>
              <ul className="space-y-3 text-zinc-600">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0" />
                  <span><strong className="text-zinc-900 font-medium">Centralized Control:</strong> Manage multiple branches, staff roles, and global menus from a single dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0" />
                  <span><strong className="text-zinc-900 font-medium">Data Synchronization:</strong> Local-first architecture ensures fast performance on-site while background sync keeps the cloud database up to date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0" />
                  <span><strong className="text-zinc-900 font-medium">Real-time Analytics:</strong> Monitor sales, inventory alerts, and staff performance metrics across all your locations in real-time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} RestaurantOS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Mobile Header (Hidden on large screens) */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">RestaurantOS</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-zinc-500 mt-2 text-sm">Sign in to your account or use the demo to continue.</p>
          </div>

          <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                loginMode === 'password'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('pin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                loginMode === 'pin'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Keyboard className="h-4 w-4" /> Quick PIN
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loginMode === 'password' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-700 text-xs uppercase tracking-wider font-semibold">Username / Email / Phone</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 h-11 rounded-lg focus:border-zinc-500 focus:ring-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-700 text-xs uppercase tracking-wider font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 h-11 rounded-lg focus:border-zinc-500 focus:ring-zinc-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
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
                      className="border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-zinc-600">Remember me</Label>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="pin" className="text-zinc-700 text-xs uppercase tracking-wider font-semibold block text-center lg:text-left">Enter 4-Digit PIN</Label>
                <div className="flex justify-center lg:justify-start gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                        pin[i]
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-transparent'
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
                  className="opacity-0 absolute -z-10 w-0 h-0"
                  autoFocus
                />
                <p className="text-center lg:text-left text-xs text-zinc-500 mt-2">Default PIN: 1234</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11 rounded-lg text-base font-medium transition-all"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loginMode === 'pin' ? 'Unlock' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 font-medium tracking-wide">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-11 rounded-lg text-base font-medium transition-all flex items-center justify-center gap-2 border-zinc-300 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google (Demo Account)
          </Button>

          {/* Offline indicator */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-zinc-500 mt-8">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Offline Mode — No Internet Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
