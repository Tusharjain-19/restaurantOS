import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, ShoppingCart, DollarSign, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const LazyCharts = lazy(() => import('./DashboardCharts'));

const stats = [
  { title: "Today's Revenue", value: '₹45,230', change: '+12%', icon: DollarSign },
  { title: 'Orders', value: '127', change: '+8%', icon: ShoppingCart },
  { title: 'Active Tables', value: '18/24', change: '', icon: LayoutDashboard },
  { title: 'Avg Order Value', value: '₹356', change: '+5%', icon: TrendingUp },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Welcome & Tour Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-zinc-900 to-zinc-950 p-6 md:p-8 text-white shadow-lg">
        {/* Glow effect */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to RestaurantOS! 🍽️</h2>
            <p className="text-zinc-400 max-w-2xl text-xs md:text-sm leading-relaxed">
              Experience the unified dining ecosystem. All operations are running locally in your browser (stored safely in IndexedDB). You can start using the POS immediately, customize the menu, or take a quick tour of our features.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> Browser-Stored Mode</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 text-success animate-spin-slow" /> Supabase-Ready Sync</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button onClick={() => navigate('/about')} className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl h-11 px-5">
              <BookOpen className="h-4 w-4 mr-2" /> Start Tour & Guide
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                <p className="text-lg font-bold text-card-foreground">{s.value}</p>
                {s.change && <span className="text-xs text-success">{s.change}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Suspense fallback={
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      }>
        <LazyCharts />
      </Suspense>
    </div>
  );
}
