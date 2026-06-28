// ─── POST /api/tasks/[taskId]/complete ────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { cancelReminders } from '@/lib/notifications/reminders';
import { FieldValue } from 'firebase-admin/firestore';
import { format } from 'date-fns';

type Params = { params: Promise<{ taskId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { taskId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    // Complete the task
    await adminDb.doc(`users/${uid}/tasks/${taskId}`).update({
      status: 'completed',
      completedAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await cancelReminders(taskId, uid);

    // ── Update streak ──────────────────────────────────────────────────────
    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data() ?? {};
    const lastStreakDate = userData.streakLastUpdatedDate as string | undefined;

    let streakUpdate: Record<string, unknown> = {
      totalTasksCompleted: FieldValue.increment(1),
    };

    if (lastStreakDate !== today) {
      // First completion today — increment streak
      const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd');
      const isConsecutive = lastStreakDate === yesterday;
      const newStreak = isConsecutive ? (userData.currentStreak ?? 0) + 1 : 1;

      streakUpdate = {
        ...streakUpdate,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userData.longestStreak ?? 0),
        streakLastUpdatedDate: today,
      };
    }

    await userRef.update(streakUpdate);

    // ── Update goal progress if task is linked ─────────────────────────────
    const taskDoc = await adminDb.doc(`users/${uid}/tasks/${taskId}`).get();
    const linkedGoalId = taskDoc.data()?.linkedGoalId;
    if (linkedGoalId) {
      const goalRef = adminDb.doc(`users/${uid}/goals/${linkedGoalId}`);
      const goalDoc = await goalRef.get();
      if (goalDoc.exists) {
        const goalData = goalDoc.data()!;
        const linkedTaskIds: string[] = goalData.linkedTaskIds ?? [];
        const allTasksSnap = await adminDb
          .collection(`users/${uid}/tasks`)
          .where('linkedGoalId', '==', linkedGoalId)
          .where('status', '==', 'completed')
          .get();

        const completedCount = allTasksSnap.size;
        const progressPercent = linkedTaskIds.length > 0
          ? Math.round((completedCount / linkedTaskIds.length) * 100)
          : 0;

        await goalRef.update({ progressPercent });
      }
    }

    const completed = await adminDb.doc(`users/${uid}/tasks/${taskId}`).get();
    return NextResponse.json({ ...completed.data(), taskId, completedAt: now });
  } catch (error) {
    console.error('[POST /api/tasks/[taskId]/complete]', error);
    return NextResponse.json({ message: 'Failed to complete task' }, { status: 500 });
  }
}
