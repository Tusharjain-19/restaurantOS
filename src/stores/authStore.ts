import { create } from 'zustand';
import { db, type StaffMember, seedDatabase } from '@/lib/db';
import { pullAllData, pushAllData, clearCachedRestaurantId } from '@/lib/syncService';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'manager' | 'captain' | 'cashier' | 'kitchen' | 'delivery';

export interface UserProfile {
  id: number;
  email?: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone: string;
}

interface AuthState {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isDemoMode: boolean;
  setUser: (user: UserProfile | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setIsDemoMode: (isDemoMode: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithPin: (pin: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: number) => Promise<UserProfile | null>;
  initialize: () => Promise<void>;
}

function staffToProfile(staff: StaffMember): UserProfile {
  return {
    id: staff.id!,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    avatar_url: staff.avatar_url,
    phone: staff.phone,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  isDemoMode: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  setIsDemoMode: (isDemoMode) => set({ isDemoMode }),

  initialize: async () => {
    if (get().initialized) return;
    try {
      await seedDatabase();
      
      // Listen for Supabase auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          // Link Supabase user to staff record
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (staffData) {
            const profile = staffToProfile(staffData);
            set({ user: profile, profile, loading: false });
            localStorage.setItem('ros_current_user', String(staffData.id));
            pullAllData().catch(console.error);
          } else if (localStorage.getItem('ros_demo_mode') === 'true') {
            // Demo mode fallback
            const allStaff = await db.staff.toArray();
            const admin = allStaff.find(s => s.role === 'admin');
            if (admin) {
              const profile = staffToProfile(admin);
              profile.name = 'Default';
              profile.email = session.user.email || 'demo@gmail.com';
              set({ user: profile, profile, isDemoMode: true });
            }
          }
        } else {
          // No session
          set({ user: null, profile: null });
        }
      });

      const savedDemoMode = localStorage.getItem('ros_demo_mode');
      if (savedDemoMode === 'true') {
        set({ isDemoMode: true });
      }
      
      const savedUserId = localStorage.getItem('ros_current_user');
      if (savedUserId) {
        const staff = await db.staff.get(Number(savedUserId));
        if (staff && staff.is_active) {
          const profile = staffToProfile(staff);
          if (savedDemoMode === 'true') {
            profile.name = 'Default';
            profile.email = 'demo@gmail.com';
          }
          set({ user: profile, profile, loading: false, initialized: true });
          pullAllData().catch(console.error);
          return;
        }
      }
      set({ loading: false, initialized: true });
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    
    // Demo Account Bypass
    if (email === 'admin@restaurant.com' && password === 'password123') {
      try {
        localStorage.setItem('ros_demo_mode', 'true');
        const allStaff = await db.staff.toArray();
        const adminStaff = allStaff.find(s => s.role === 'admin') || allStaff[0];
        
        if (adminStaff) {
          const profile = staffToProfile(adminStaff);
          profile.name = 'Demo Admin';
          profile.email = 'admin@restaurant.com';
          localStorage.setItem('ros_current_user', String(adminStaff.id));
          set({ user: profile, profile, loading: false, isDemoMode: true });
          return { error: null };
        }
      } catch (e) {
        console.error('Demo login failed:', e);
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('email', email)
          .single();

        if (staffData) {
          const profile = staffToProfile(staffData);
          localStorage.setItem('ros_current_user', String(staffData.id));
          set({ user: profile, profile, loading: false, isDemoMode: false });
          pullAllData().catch(console.error);
          return { error: null };
        }
      }

      set({ loading: false });
      return { error: 'Login successful but no associated staff profile found.' };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      set({ loading: false });
      return { error: 'Login failed. Please try again.' };
    }
  },

  signInWithPin: async (pin) => {
    set({ loading: true });
    try {
      const staff = await db.staff.where('pin').equals(pin).first();
      if (!staff || !staff.is_active) {
        set({ loading: false });
        return { error: 'Invalid PIN' };
      }
      const profile = staffToProfile(staff);
      localStorage.setItem('ros_current_user', String(staff.id));
      set({ user: profile, profile, loading: false });
      
      // Pull data from cloud after pin login
      pullAllData().catch(console.error);
      
      return { error: null };
    } catch (error) {
      set({ loading: false });
      return { error: 'PIN login failed' };
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      localStorage.setItem('ros_demo_mode', 'true');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
      set({ loading: false });
      return { error: error.message || 'Google Login failed.' };
    }
  },

  signOut: async () => {
    await pushAllData().catch(console.error);
    await supabase.auth.signOut();
    clearCachedRestaurantId();
    localStorage.removeItem('ros_current_user');
    localStorage.removeItem('ros_demo_mode');
    set({ user: null, profile: null, isDemoMode: false });
  },

  fetchProfile: async (userId: number) => {
    try {
      const staff = await db.staff.get(userId);
      if (!staff) return null;
      const profile = staffToProfile(staff);
      set({ profile });
      return profile;
    } catch {
      return null;
    }
  },
}));
