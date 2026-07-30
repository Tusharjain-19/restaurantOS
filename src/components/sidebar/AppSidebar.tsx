import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Grid3X3, ChefHat, Receipt,
  Package, BarChart3, Users, Settings, UserCircle
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { hasAccess } from '@/hooks/useAuth';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'POS', url: '/pos', icon: ShoppingCart },
  { title: 'Tables', url: '/tables', icon: Grid3X3 },
  { title: 'Kitchen', url: '/kitchen', icon: ChefHat },
  { title: 'Billing', url: '/billing', icon: Receipt },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Customers', url: '/customers', icon: UserCircle },
  { title: 'Staff', url: '/staff', icon: Users },

  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { role } = useAuth();

  const visibleItems = navItems.filter((item) => hasAccess(role, item.url));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
          R
        </div>
        {!collapsed && <span className="font-bold text-sidebar-primary text-sm">RestaurantOS</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.title === 'Kitchen' ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-sidebar-accent/50 flex w-full items-center gap-2"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink
                        to={item.url}
                        end={item.url === '/dashboard'}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
