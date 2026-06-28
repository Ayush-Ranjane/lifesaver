'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_USER_SETTINGS, DEFAULT_AI_PREFERENCES } from '@/types';
import type { UserProfile } from '@/types';

const PUBLIC_ROUTES = ['/', '/auth'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setFirebaseUser, setUserProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        try {
          // Fetch or create the Firestore user profile
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);

            // Redirect logic for returning users
            if (PUBLIC_ROUTES.includes(pathname) || pathname === '/auth') {
              const defaultView = data.settings?.defaultView ?? 'dashboard';
              router.replace(`/${defaultView}`);
            }
          } else {
            // New user — create minimal profile in Firestore
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName ?? '',
              photoURL: firebaseUser.photoURL,
              phone: null,
              role: 'professional',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language ?? 'en-IN',
              onboardingCompleted: true,
              createdAt: new Date(),
              lastLoginAt: new Date(),
              lastActiveAt: new Date(),
              totalTasksCreated: 0,
              totalTasksCompleted: 0,
              totalShipped: 0,
              podIds: [],
              currentStreak: 0,
              longestStreak: 0,
              streakLastUpdatedDate: '',
              focusScore: 0,
              googleCalendarConnected: false,
              googleCalendarId: null,
              googleRefreshToken: null,
              notionConnected: false,
              notionWorkspaceId: null,
              jiraConnected: false,
              jiraSiteId: null,
              fcmToken: null,
              fcmTokens: [],
              settings: DEFAULT_USER_SETTINGS,
              aiPreferences: DEFAULT_AI_PREFERENCES,
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            router.replace('/dashboard');
          }
        } catch (error) {
          console.error("Firestore Profile Error:", error);
          alert(`Login succeeded, but failed to connect to Firestore Database. Have you enabled Firestore in your Firebase Console? Error: ${(error as Error).message}`);
          auth.signOut();
        }
      } else {
        reset();
        // Protect app routes
        const isProtected = !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith('/auth');
        if (isProtected) router.replace('/auth');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, setFirebaseUser, setUserProfile, setLoading, reset]);

  return <>{children}</>;
}
