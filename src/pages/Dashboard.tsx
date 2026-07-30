import { lazy, Suspense } from 'react';
import { LayoutDashboard, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LazyCharts = lazy(() => import('./DashboardCharts'));

const stats = [
  { title: "Today's Revenue", value: '₹45,230', change: '+12%', icon: DollarSign },
  { title: 'Orders', value: '127', change: '+8%', icon: ShoppingCart },
  { title: 'Active Tables', value: '18/24', change: '', icon: LayoutDashboard },
  { title: 'Avg Order Value', value: '₹356', change: '+5%', icon: TrendingUp },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

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
