import { create } from 'zustand';
import { db, type StaffMember, seedDatabase } from '@/lib/db';
import { pullAllData, pushAllData, clearCachedRestaurantId } from '@/lib/syncService';

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
      const savedDemoMode = localStorage.getItem('ros_demo_mode');
      if (savedDemoMode === 'true') {
        set({ isDemoMode: true });
      }
      
      // Check for saved session
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
          pullAllData().catch(console.error); // Background sync
          return;
        }
      }
      set({ loading: false, initialized: true });
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (identifier, password) => {
    set({ loading: true });
    try {
      try { await seedDatabase(); } catch (e) { console.warn('Seed skipped:', e); }
      // identifier can be email, phone, or name
      const allStaff = await db.staff.toArray();
      console.log('[Auth] Staff count:', allStaff.length, 'Looking for:', identifier);
      const staff = allStaff.find(s =>
        s.is_active && (
          (s.email && s.email.toLowerCase() === identifier.toLowerCase()) ||
          s.phone === identifier ||
          s.name.toLowerCase() === identifier.toLowerCase()
        ) && s.password_hash === password
      );

      if (!staff) {
        set({ loading: false });
        return { error: 'Invalid credentials. Default: Admin / admin123' };
      }

      const profile = staffToProfile(staff);
      localStorage.setItem('ros_current_user', String(staff.id));
      set({ user: profile, profile, loading: false });
      
      // Pull data from cloud after login
      pullAllData().catch(console.error);
      
      return { error: null };
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
      try { await seedDatabase(); } catch (e) { console.warn('Seed skipped:', e); }
      const allStaff = await db.staff.toArray();
      const adminStaff = allStaff.find(s => s.role === 'admin' && s.is_active);
      
      if (!adminStaff) {
        set({ loading: false });
        return { error: 'Could not create demo account' };
      }

      const profile = staffToProfile(adminStaff);
      profile.name = 'Default';
      profile.email = 'demo@gmail.com';
      
      localStorage.setItem('ros_current_user', String(adminStaff.id));
      localStorage.setItem('ros_demo_mode', 'true');
      
      set({ user: profile, profile, isDemoMode: true, loading: false });
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Google login error:', error);
      set({ loading: false });
      return { error: 'Google Login failed. Please try again.' };
    }
  },

  signOut: async () => {
    // Push data to cloud before signing out
    await pushAllData().catch(console.error);
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
