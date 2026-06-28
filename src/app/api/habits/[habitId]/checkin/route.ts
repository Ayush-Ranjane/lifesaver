// ─── POST /api/habits/[habitId]/checkin ───────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type Params = { params: Promise<{ habitId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { habitId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd');

    const habitRef = adminDb.doc(`users/${uid}/habits/${habitId}`);
    const habitDoc = await habitRef.get();
    if (!habitDoc.exists) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const data = habitDoc.data()!;
    const entries: { date: string }[] = data.entries ?? [];

    // Already checked in today
    if (entries.some(e => e.date === today)) {
      return NextResponse.json({ message: 'Already checked in today' }, { status: 409 });
    }

    // Streak update
    const lastDate = data.streakLastUpdatedDate as string | undefined;
    const isConsecutive = lastDate === yesterday || lastDate === today;
    const newStreak = isConsecutive ? (data.currentStreak ?? 0) + 1 : 1;

    // Check milestone: 7, 30, 100 days
    const milestones = data.milestonesReached ?? [];
    const newMilestones = [7, 30, 100].filter(m => newStreak === m && !milestones.includes(m));

    await habitRef.update({
      entries: FieldValue.arrayUnion({ entryId: uuidv4(), date: today, completedAt: now }),
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, data.longestStreak ?? 0),
      streakLastUpdatedDate: today,
      ...(newMilestones.length && { milestonesReached: FieldValue.arrayUnion(...newMilestones) }),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ currentStreak: newStreak, milestone: newMilestones[0] ?? null });
  } catch (error) {
    console.error('[POST /api/habits/[habitId]/checkin]', error);
    return NextResponse.json({ message: 'Check-in failed' }, { status: 500 });
  }
}
