import { useEffect } from 'react';
import { useAuthStore, type UserRole } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          store.setUser(session.user);
          await store.fetchProfile(session.user.id);
        } else {
          store.setUser(null);
          store.setProfile(null);
        }
        store.setLoading(false);
        store.setInitialized(true);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        store.setUser(session.user);
        await store.fetchProfile(session.user.id);
      }
      store.setLoading(false);
      store.setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: store.user,
    profile: store.profile,
    role: store.profile?.role ?? null,
    loading: store.loading,
    signIn: store.signIn,
    signOut: store.signOut,
  };
}

const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: ['*'],
  manager: ['/dashboard', '/pos', '/tables', '/reports', '/inventory', '/staff', '/customers', '/settings', '/onboarding'],
  captain: ['/pos', '/tables'],
  cashier: ['/pos', '/billing', '/customers'],
  kitchen: ['/kitchen'],
  delivery: ['/delivery'],
};

export function hasAccess(role: UserRole | null, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[role];
  if (allowed.includes('*')) return true;
  return allowed.some((r) => path.startsWith(r));
}
