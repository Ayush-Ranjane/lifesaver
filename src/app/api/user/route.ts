import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { AIPreferences, UserProfile, UserSettings } from '@/types';

function serializeUser(data: FirebaseFirestore.DocumentData, uid: string): UserProfile {
  const { googleRefreshToken, githubToken, ...safe } = data;
  return {
    ...safe,
    uid,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    lastLoginAt: data.lastLoginAt?.toDate?.() ?? data.lastLoginAt,
    lastActiveAt: data.lastActiveAt?.toDate?.() ?? data.lastActiveAt,
    githubConnected: Boolean(data.githubConnected || githubToken),
    googleCalendarConnected: Boolean(data.googleCalendarConnected || googleRefreshToken),
  } as UserProfile;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const doc = await adminDb.doc(`users/${uid}`).get();
    if (!doc.exists) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json(serializeUser(doc.data()!, uid));
  } catch (error) {
    console.error('[GET /api/user]', error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const body = await req.json();
    const updates: Record<string, unknown> = {
      lastActiveAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.displayName === 'string') {
      updates.displayName = body.displayName.trim().slice(0, 100);
    }
    if (body.settings && typeof body.settings === 'object') {
      updates.settings = body.settings as UserSettings;
    }
    if (body.aiPreferences && typeof body.aiPreferences === 'object') {
      updates.aiPreferences = body.aiPreferences as AIPreferences;
    }

    const ref = adminDb.doc(`users/${uid}`);
    await ref.update(updates);
    const updated = await ref.get();

    return NextResponse.json(serializeUser(updated.data()!, uid));
  } catch (error) {
    console.error('[PATCH /api/user]', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
