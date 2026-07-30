import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantRealtime } from '@/hooks/useRestaurantRealtime';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/waiter/home', icon: Home, label: 'Home' },
  { to: '/waiter/my-orders', icon: ClipboardList, label: 'Orders' },
  { to: '/waiter/alerts', icon: Bell, label: 'Alerts' },
  { to: '/waiter/profile', icon: User, label: 'Profile' },
];

export default function WaiterLayout() {
  const { profile } = useAuth();
  useRestaurantRealtime(profile?.restaurant_id);
  const location = useLocation();
  const hideTabs = /\/waiter\/order\//.test(location.pathname);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      {!hideTabs && (
        <nav className="fixed bottom-0 inset-x-0 z-30 h-16 bg-card border-t border-border flex items-stretch">
          {tabs.map((t) => {
            const active = location.pathname.startsWith(t.to);
            return (
              <NavLink
                key={t.to}
                to={t.to}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <t.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                {t.label}
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
