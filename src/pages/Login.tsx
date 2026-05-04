import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, LogIn, Chrome, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
    }
    // Google redirect happens automatically via Supabase
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans selection:bg-zinc-900 selection:text-white">
      {/* Left Column: Atmospheric Brand Space */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950">
        <img
          src="/hq_login_bg.png"
          alt="Modern Restaurant"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
              <LogIn className="h-6 w-6 text-zinc-950" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">RestaurantOS</span>
          </div>

          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Empowering <span className="text-zinc-400">Operations.</span>
              </h1>
              <p className="text-xl text-zinc-300 leading-relaxed font-light">
                The most efficient way to manage your restaurant's daily workflow from a single, intuitive interface.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Core Features</h3>
                <div className="space-y-3">
                  {[
                    { title: "Real-time Order Management", desc: "Track every order from punch to payout with live status updates." },
                    { title: "Kitchen Sync & Display", desc: "Instant KOT routing and kitchen timer management for zero delays." },
                    { title: "Table Status & Management", desc: "Interactive floor plans with real-time occupancy and billing status." },
                    { title: "Live Inventory Tracking", desc: "Automated stock alerts and ingredient-level tracking for efficiency." }
                  ].map((feature, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center gap-3 text-zinc-300 mb-1">
                        <CheckCircle2 className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                        <span className="text-sm font-semibold tracking-wide">{feature.title}</span>
                      </div>
                      <p className="text-xs text-zinc-500 pl-8 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  Designed for modern dining establishments, RestaurantOS streamlines back-of-house coordination 
                  and front-of-house service into one cohesive digital ecosystem.
                </p>
              </div>
            </div>
          </div>

          <div className="text-zinc-500 text-sm font-medium">
            © 2026 RestaurantOS. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Space */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Staff Login</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Password</Label>
                  <a href="#" className="text-xs font-medium text-zinc-900 hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-950 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                role="checkbox"
                onClick={() => setRememberMe(!rememberMe)}
                className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${rememberMe ? 'bg-zinc-950 border-zinc-950' : 'bg-white border-zinc-300'}`}
              >
                {rememberMe && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
              </button>
              <Label onClick={() => setRememberMe(!rememberMe)} className="text-sm font-medium text-zinc-600 cursor-pointer select-none">Remember me for 30 days</Label>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold rounded-lg shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail('admin@restaurant.com');
                  setPassword('password123');
                }}
                className="w-full h-12 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                Try Demo Account
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account? <a href="#" className="font-semibold text-zinc-950 hover:underline">Contact Manager</a>
          </p>
        </div>
      </div>
    </div>
  );
}
