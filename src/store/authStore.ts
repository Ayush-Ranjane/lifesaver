// ─── Auth Zustand Store ────────────────────────────────────────────────────────
// Tracks Firebase Auth state globally. Populated by AuthProvider on mount.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

interface AuthState {
  // Firebase Auth user (contains uid, email, photo, etc.)
  firebaseUser: User | null;
  // Full Firestore user profile (contains settings, preferences, etc.)
  userProfile: UserProfile | null;
  // Three-state loading: null = not yet determined, true = loading, false = done
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setFirebaseUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      firebaseUser: null,
      userProfile: null,
      isLoading: true,
      isAuthenticated: false,

      setFirebaseUser: (user) =>
        set({ firebaseUser: user, isAuthenticated: !!user }),

      setUserProfile: (profile) =>
        set({ userProfile: profile }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      reset: () =>
        set({ firebaseUser: null, userProfile: null, isAuthenticated: false, isLoading: false }),
    }),
    { name: 'AuthStore' }
  )
);
