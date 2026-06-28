// ─── POST /api/pods/goals/submit ───────────────────────────────────────────────
// Submits a weekly goal to a specific pod.

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { podId, goalTitle } = await req.json();
    if (!podId || !goalTitle) return NextResponse.json({ message: 'podId and goalTitle required' }, { status: 400 });

    const memberRef = adminDb.doc(`pods/${podId}/members/${uid}`);
    const snap = await memberRef.get();

    if (!snap.exists) {
      return NextResponse.json({ message: 'Not a member of this pod' }, { status: 403 });
    }

    await memberRef.update({
      weeklyGoal: goalTitle,
      completedGoal: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/pods/goals/submit]', err);
    return NextResponse.json({ message: 'Failed to submit goal' }, { status: 500 });
  }
}
