import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { MobileNav } from '@/components/sidebar/MobileNav';
import { PinLoginModal } from '@/components/auth/PinLoginModal';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Menu, Moon, Sun, X, CheckCircle2, ChevronRight, LayoutDashboard, Settings, Users, Utensils, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(d => !d)] as const;
}

export default function AppLayout() {
  const { profile, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [dark, toggleDark] = useDarkMode();
  const [showReport, setShowReport] = useState(true);
  const [showTour, setShowTour] = useState(() => isDemoMode && !localStorage.getItem('ros_tour_completed'));
  const [tourStep, setTourStep] = useState(0);

  useKeyboardShortcuts();

  const resetActivity = useCallback(() => setLastActivity(Date.now()), []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetActivity));
    return () => events.forEach((e) => window.removeEventListener(e, resetActivity));
  }, [resetActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 5 * 60 * 1000) {
        setPinModalOpen(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const tourSteps = [
    {
      title: "Welcome to RestaurantOS",
      description: "You're now in the Demo Hub. We've pre-loaded 20+ menu items and 15 tables across 3 floors to help you explore. Let's take a quick tour!",
      icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
      action: () => { navigate('/dashboard'); setTourStep(1); }
    },
    {
      title: "Real-time Dashboard",
      description: "Monitor your restaurant's performance at a glance. Track sales, order counts, and top-selling items in real-time.",
      icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
      target: "/dashboard",
      action: () => { navigate('/pos'); setTourStep(2); }
    },
    {
      title: "Point of Sale (POS)",
      description: "This is where the magic happens. Take orders, customize items with variants, and send KOTs to the kitchen instantly.",
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      target: "/pos",
      action: () => { navigate('/tables'); setTourStep(3); }
    },
    {
      title: "Table Management",
      description: "Visualize your restaurant floor. Manage table occupancy, reservations, and billing status across multiple floors.",
      icon: <Users className="h-6 w-6 text-primary" />,
      target: "/tables",
      action: () => { navigate('/kitchen'); setTourStep(4); }
    },
    {
      title: "Kitchen Display System",
      description: "Keep your chefs organized. Track preparation times, manage KOT priorities, and notify servers when food is ready.",
      icon: <Utensils className="h-6 w-6 text-primary" />,
      target: "/kitchen",
      action: () => { navigate('/billing'); setTourStep(5); }
    },
    {
      title: "Billing & Invoicing",
      description: "Quickly generate bills, apply discounts, and process multiple payment methods including UPI and Cards.",
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
      target: "/billing",
      action: () => { navigate('/inventory'); setTourStep(6); }
    },
    {
      title: "Menu & Inventory",
      description: "Manage your 20+ pre-loaded items here. Add new dishes, set prices, and track ingredient stock levels.",
      icon: <Utensils className="h-6 w-6 text-primary" />,
      target: "/inventory",
      action: () => { navigate('/reports'); setTourStep(7); }
    },
    {
      title: "Advanced Analytics",
      description: "Dive deep into your data. Filter reports by date, category, or payment method to gain business insights.",
      icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
      target: "/reports",
      action: () => { navigate('/staff'); setTourStep(8); }
    },
    {
      title: "Staff Management",
      description: "Manage your team and their access levels. Each staff member gets a unique PIN for secure terminal login.",
      icon: <Users className="h-6 w-6 text-primary" />,
      target: "/staff",
      action: () => { navigate('/customers'); setTourStep(9); }
    },
    {
      title: "Customer Loyalty",
      description: "Build relationships with your guests. Track visit history, spending patterns, and manage loyalty points.",
      icon: <Users className="h-6 w-6 text-primary" />,
      target: "/customers",
      action: () => { navigate('/settings'); setTourStep(10); }
    },
    {
      title: "Global Settings",
      description: "Finalize your setup. Configure taxes, printers, and restaurant branding for professional receipts.",
      icon: <Settings className="h-6 w-6 text-primary" />,
      target: "/settings",
      action: () => { completeTour(); }
    }
  ];

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('ros_tour_completed', 'true');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger className="hidden md:flex" />
            <div className="md:hidden">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </div>
            {isDemoMode && (
              <div className="hidden sm:flex items-center gap-2 bg-zinc-100 text-zinc-900 px-3 py-1.5 rounded-full text-xs font-semibold mr-auto ml-4 border border-zinc-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900"></span>
                </span>
                Free 7 Day Trial
              </div>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-medium text-foreground">{profile?.name ?? 'User'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {profile?.name?.charAt(0) ?? 'U'}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
            <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>}>
              <Outlet />
            </Suspense>
          </main>

          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      <PinLoginModal
        open={pinModalOpen}
        onClose={() => { setPinModalOpen(false); resetActivity(); }}
        onSwitchUser={() => { setPinModalOpen(false); signOut(); navigate('/login'); }}
      />

      {isDemoMode && showTour && tourStep < tourSteps.length && (
        <div className="fixed bottom-6 right-6 z-[110] w-full max-w-sm">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl border p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
                {tourSteps[tourStep].icon}
              </div>
              <button onClick={completeTour} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold mb-2">{tourSteps[tourStep].title}</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {tourSteps[tourStep].description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tourSteps.map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i === tourStep ? 'bg-zinc-900 w-4' : 'bg-zinc-200'}`} />
                ))}
              </div>
              <Button size="sm" onClick={tourSteps[tourStep].action} className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white">
                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDemoMode && showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card text-card-foreground w-full max-w-lg rounded-xl shadow-2xl p-6 border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Button variant="ghost" size="icon" onClick={() => setShowReport(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Project Report</h2>
              <p className="text-muted-foreground text-sm mt-1">Restaurant Hub Demo Summary</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="bg-muted p-3 rounded-lg border">
                <p className="font-semibold mb-1">Project Details</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Platform: React + TypeScript + Vite</li>
                  <li>Role: Admin Demo Account (Default)</li>
                  <li>Status: Free Trial Active (7 Days Remaining)</li>
                  <li>Capabilities: Full Access unlocked for review.</li>
                </ul>
              </div>
              <p>Thank you for trying out our system! This demo environment allows you to test out all features in a sandbox setting.</p>
              <p className="font-medium text-zinc-900">Project Link: <a href="https://github.com/Tusharjain-19/restaurantOS/blob/main/README.md" className="underline" target="_blank" rel="noreferrer">GitHub README</a></p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowReport(false)} className="bg-zinc-900 hover:bg-zinc-800 text-white">Close Report</Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
