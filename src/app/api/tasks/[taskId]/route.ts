// ─── GET/PATCH/DELETE /api/tasks/[taskId] ─────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { cancelReminders, scheduleReminders } from '@/lib/notifications/reminders';
import { FieldValue } from 'firebase-admin/firestore';
import type { Task, UpdateTaskInput } from '@/types';

type Params = { params: Promise<{ taskId: string }> };

// ─── GET /api/tasks/[taskId] ──────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { taskId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const doc = await adminDb.doc(`users/${uid}/tasks/${taskId}`).get();
    if (!doc.exists) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const data = doc.data()!;
    return NextResponse.json({
      ...data,
      taskId: doc.id,
      deadline: data.deadline?.toDate?.(),
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.(),
      completedAt: data.completedAt?.toDate?.() ?? null,
    });
  } catch (error) {
    console.error('[GET /api/tasks/[taskId]]', error);
    return NextResponse.json({ message: 'Failed to fetch task' }, { status: 500 });
  }
}

// ─── PATCH /api/tasks/[taskId] ────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { taskId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const updates: UpdateTaskInput = await req.json();
    const now = new Date();

    // If deadline changed, reschedule reminders
    const deadlineChanged = !!updates.deadline;
    if (deadlineChanged) {
      await cancelReminders(taskId, uid);
    }

    const updatePayload = {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
      ...(updates.deadline && { deadline: new Date(updates.deadline as unknown as string) }),
    };

    await adminDb.doc(`users/${uid}/tasks/${taskId}`).update(updatePayload);

    // Re-schedule reminders with new deadline
    if (deadlineChanged) {
      const doc = await adminDb.doc(`users/${uid}/tasks/${taskId}`).get();
      if (doc.exists) {
        const taskData = { ...doc.data(), taskId } as Task;
        await scheduleReminders(taskData, uid);
      }
    }

    const updated = await adminDb.doc(`users/${uid}/tasks/${taskId}`).get();
    const data = updated.data()!;
    return NextResponse.json({ ...data, taskId, updatedAt: now });
  } catch (error) {
    console.error('[PATCH /api/tasks/[taskId]]', error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

// ─── DELETE /api/tasks/[taskId] — soft delete ─────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { taskId } = await params;
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    await cancelReminders(taskId, uid);
    await adminDb.doc(`users/${uid}/tasks/${taskId}`).update({
      isArchived: true,
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/tasks/[taskId]]', error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}
