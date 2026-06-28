// ─── POST /api/goals/ship — Mark a goal as Shipped 🚢 ──────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

function nanoid(length = 21) {
  return randomBytes(Math.ceil(length * 3 / 4)).toString('base64url').slice(0, length);
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { goalId, message, emoji = '🚢', isPublic = true } = await req.json();
    if (!goalId) return NextResponse.json({ message: 'goalId is required' }, { status: 400 });

    // Read goal
    const goalRef = adminDb.doc(`users/${uid}/goals/${goalId}`);
    const goalSnap = await goalRef.get();
    if (!goalSnap.exists) return NextResponse.json({ message: 'Goal not found' }, { status: 404 });

    const goal = goalSnap.data()!;

    // Read user profile for display info
    const userSnap = await adminDb.doc(`users/${uid}`).get();
    const user = userSnap.data() ?? {};

    // Calculate goal duration
    const createdAt = goal.createdAt?.toDate?.() ?? new Date();
    const now = new Date();
    const diffDays = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const goalDuration = diffDays < 7 ? `${diffDays} days` : diffDays < 30 ? `${Math.round(diffDays / 7)} weeks` : `${Math.round(diffDays / 30)} months`;

    // Create shippedWall doc
    const shipId = nanoid();
    const wallDoc = {
      userId: uid,
      displayName: user.displayName ?? 'Anonymous',
      avatarUrl: user.photoURL ?? null,
      goalTitle: goal.title,
      goalDuration,
      shippedAt: FieldValue.serverTimestamp(),
      emoji,
      message: message?.substring(0, 140) ?? null,
      likes: 0,
      likedBy: [],
      isPublic,
    };

    const batch = adminDb.batch();

    if (isPublic) {
      batch.set(adminDb.doc(`shippedWall/${shipId}`), wallDoc);
    }

    // Update goal
    batch.update(goalRef, {
      isShipped: true,
      shippedAt: FieldValue.serverTimestamp(),
      status: 'completed',
    });

    // Increment user totalShipped counter
    batch.update(adminDb.doc(`users/${uid}`), {
      totalShipped: FieldValue.increment(1),
    });

    await batch.commit();

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wall/${shipId}`;
    return NextResponse.json({ shipId, shareUrl });
  } catch (err) {
    console.error('[POST /api/goals/ship]', err);
    return NextResponse.json({ message: 'Ship failed' }, { status: 500 });
  }
}
