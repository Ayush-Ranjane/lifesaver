'use client';

import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { db, getFirebaseMessaging } from '@/lib/firebase/client';

export function useFCMRegistration() {
  const { firebaseUser, userProfile } = useAuthStore();

  useEffect(() => {
    if (!firebaseUser || !userProfile?.settings?.pushNotificationsEnabled) return;

    let cancelled = false;

    (async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging || cancelled) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (!token || cancelled) return;

        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          fcmToken: token,
          fcmTokens: [token],
        });
      } catch (err) {
        console.warn('[FCM] Registration skipped:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [firebaseUser, userProfile?.settings?.pushNotificationsEnabled]);
}
