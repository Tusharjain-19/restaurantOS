import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { MobileNav } from '@/components/sidebar/MobileNav';
import { PinLoginModal } from '@/components/auth/PinLoginModal';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Menu, Moon, Sun, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { db } from '@/lib/db';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(d => !d)] as const;
}

export default function AppLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [dark, toggleDark] = useDarkMode();

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
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-medium text-foreground">{profile?.name ?? 'User'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {profile?.name?.charAt(0) ?? 'U'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  if (confirm("Are you sure you want to reset all local data? This will clear all orders, menu items, settings, and reload the app.")) {
                    localStorage.clear();
                    await db.delete();
                    window.location.reload();
                  }
                }}
                title="Reset Database"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
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
        onSwitchUser={async () => {
          if (confirm("Are you sure you want to reset all local data? This will clear all orders and reload.")) {
            setPinModalOpen(false);
            localStorage.clear();
            await db.delete();
            window.location.reload();
          }
        }}
      />
    </SidebarProvider>
  );
}
