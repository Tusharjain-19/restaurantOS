import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Grid3X3, ChefHat, Settings
} from 'lucide-react';
import { useAuth, hasAccess } from '@/hooks/useAuth';

const mobileItems = [
  { title: 'Home', url: '/dashboard', icon: LayoutDashboard },
  { title: 'POS', url: '/pos', icon: ShoppingCart },
  { title: 'Tables', url: '/tables', icon: Grid3X3 },
  { title: 'Kitchen', url: '/kitchen', icon: ChefHat },
  { title: 'More', url: '/settings', icon: Settings },
];

export function MobileNav() {
  const location = useLocation();
  const { role } = useAuth();

  const visibleItems = mobileItems.filter((item) => hasAccess(role, item.url));

  return (
    <nav className="flex border-t bg-card">
      {visibleItems.map((item) => {
        const active = location.pathname.startsWith(item.url);
        if (item.title === 'Kitchen') {
          return (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </a>
          );
        }
        return (
          <RouterNavLink
            key={item.url}
            to={item.url}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
              active ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </RouterNavLink>
        );
      })}
    </nav>
  );
}
