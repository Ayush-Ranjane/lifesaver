// ─── POST /api/tasks/[taskId]/snooze ─────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { cancelReminders, scheduleReminders } from '@/lib/notifications/reminders';
import { FieldValue } from 'firebase-admin/firestore';
import type { Task } from '@/types';

type Params = { params: Promise<{ taskId: string }> };

const MAX_SNOOZES = 3;

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { taskId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const { minutes } = await req.json();
    if (!minutes || typeof minutes !== 'number' || minutes <= 0) {
      return NextResponse.json({ message: 'Invalid snooze duration' }, { status: 400 });
    }

    const taskRef = adminDb.doc(`users/${uid}/tasks/${taskId}`);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const taskData = taskDoc.data()!;
    const snoozeCount = (taskData.snoozeCount ?? 0) + 1;

    // Hard limit: 3 snoozes per task — 4th triggers AI intervention
    if (snoozeCount > MAX_SNOOZES) {
      return NextResponse.json(
        { message: 'MAX_SNOOZES_REACHED', snoozeCount },
        { status: 422 }
      );
    }

    const snoozedUntil = new Date(Date.now() + minutes * 60_000);

    await cancelReminders(taskId, uid);
    await taskRef.update({
      status: 'snoozed',
      snoozedUntil,
      snoozeCount,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Reschedule a single reminder at snoozedUntil
    const updatedTask: Task = {
      ...taskData,
      taskId,
      deadline: snoozedUntil, // treat snoozedUntil as the new effective deadline for reminder
      effort: taskData.effort ?? 'short',
    } as Task;
    await scheduleReminders(updatedTask, uid);

    return NextResponse.json({ snoozedUntil, snoozeCount });
  } catch (error) {
    console.error('[POST /api/tasks/[taskId]/snooze]', error);
    return NextResponse.json({ message: 'Failed to snooze task' }, { status: 500 });
  }
}
