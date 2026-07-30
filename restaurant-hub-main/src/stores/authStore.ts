import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'captain' | 'cashier' | 'kitchen' | 'delivery';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  pin_hash: string | null;
  restaurant_id: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    const profile = data as UserProfile;

    // Check license if user belongs to a restaurant and is not super admin
    const SUPER_ADMIN_EMAIL = 'admin@restaurantos.test';
    if (profile.restaurant_id && profile.email !== SUPER_ADMIN_EMAIL) {
      const { data: license } = await supabase
        .from('licenses')
        .select('is_active, expires_at')
        .eq('restaurant_id', profile.restaurant_id)
        .maybeSingle();

      if (!license || !license.is_active || new Date(license.expires_at) < new Date()) {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
        return null;
      }
    }

    set({ profile });
    return profile;
  },
}));
