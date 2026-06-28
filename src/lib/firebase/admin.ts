// ─── Firebase Admin SDK ────────────────────────────────────────────────────────
// Server-side only. Never import this in client components.
// Used in Next.js API route handlers for privileged Firestore access.

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import dns from 'dns';

// Force IPv4 resolution to prevent Firebase Admin SDK IPv6 timeouts
// that cause ENETUNREACH and subsequent JSON parsing errors.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Private key comes from environment as a JSON string in production,
// or a raw key string with escaped newlines in .env.local
function getAdminCredential() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey,
  });
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    const existing = getApps().find(a => a.name === 'admin');
    if (existing) return existing;
  }
  return initializeApp({ credential: getAdminCredential() }, 'admin');
}

export const adminDb = new Proxy({} as Firestore, {
  get: (_, prop) => getFirestore(getAdminApp())[prop as keyof Firestore]
});

export const adminAuth = new Proxy({} as Auth, {
  get: (_, prop) => getAuth(getAdminApp())[prop as keyof Auth]
});

export const adminStorage = new Proxy({} as Storage, {
  get: (_, prop) => getStorage(getAdminApp())[prop as keyof Storage]
});

export const adminMessaging = new Proxy({} as Messaging, {
  get: (_, prop) => getMessaging(getAdminApp())[prop as keyof Messaging]
});

// ─── ID Token verification helper ─────────────────────────────────────────────
// Used in every API route to authenticate the caller.
export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}

// ─── Extract token from Authorization header ──────────────────────────────────
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
