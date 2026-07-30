import { useEffect } from 'react';
import { useAuthStore, type UserRole } from '@/stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.initialize();
  }, []);

  return {
    user: store.user,
    profile: store.profile,
    role: store.profile?.role ?? null,
    loading: store.loading,
    initialized: store.initialized,
    isDemoMode: store.isDemoMode,
    signIn: store.signIn,
    signInWithPin: store.signInWithPin,
    signInWithGoogle: store.signInWithGoogle,
    signOut: store.signOut,
  };
}

const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: ['*'],
  manager: ['/dashboard', '/pos', '/tables', '/reports', '/inventory', '/staff', '/customers', '/settings', '/onboarding', '/billing', '/kitchen', '/delivery', '/reservations'],
  captain: ['/pos', '/tables', '/kitchen'],
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
