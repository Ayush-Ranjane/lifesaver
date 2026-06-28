// ─── GET /api/tasks — list tasks with filters
// ─── POST /api/tasks — create task with AI parse

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { breakTaskIntoSubtasks } from '@/lib/ai/breakdownTask';
import { scheduleReminders } from '@/lib/notifications/reminders';
import type { Task, CreateTaskInput } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';

// ─── GET /api/tasks ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const priorityParam = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = adminDb
      .collection(`users/${uid}/tasks`)
      .where('isArchived', '==', false)
      .orderBy('deadline', 'asc');

    if (statusParam) {
      const statuses = statusParam.split(',');
      query = query.where('status', 'in', statuses) as typeof query;
    }

    const snapshot = await query.limit(200).get();
    let tasks: Task[] = snapshot.docs.map(doc => ({
      ...(doc.data() as Omit<Task, 'taskId'>),
      taskId: doc.id,
      deadline: doc.data().deadline?.toDate?.() ?? new Date(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() ?? new Date(),
      completedAt: doc.data().completedAt?.toDate?.() ?? null,
      scheduledStart: doc.data().scheduledStart?.toDate?.() ?? null,
      snoozedUntil: doc.data().snoozedUntil?.toDate?.() ?? null,
    }));

    // Client-side filter for category/priority (avoids extra Firestore indexes)
    if (categoryParam) {
      const cats = categoryParam.split(',');
      tasks = tasks.filter(t => cats.includes(t.category));
    }
    if (priorityParam) {
      const priorities = priorityParam.split(',');
      tasks = tasks.filter(t => priorities.includes(t.priority));
    }
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error('[GET /api/tasks]', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// ─── POST /api/tasks ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const body: CreateTaskInput = await req.json();
    const now = new Date();
    const taskId = uuidv4();

    // Get user profile for timezone
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const timezone = userDoc.data()?.timezone ?? 'Asia/Kolkata';

    const deadline = body.deadline
      ? new Date(body.deadline)
      : new Date(new Date().setHours(23, 59, 0, 0));

    const task: Omit<Task, 'taskId'> = {
      userId: uid,
      title: body.title ?? body.rawInput ?? 'Untitled Task',
      description: body.description ?? '',
      rawInput: body.rawInput ?? '',
      deadline,
      deadlineTimezone: timezone,
      priority: body.priority ?? 'medium',
      status: 'pending',
      effort: body.effort ?? 'short',
      category: body.category ?? 'other',
      tags: body.tags ?? [],
      subtasks: [],
      aiBreakdownDone: false,
      estimatedMinutes: 30,
      actualMinutes: null,
      aiConfidenceScore: 1.0,
      scheduledStart: null,
      recurrence: body.recurrence ?? null,
      remindersSent: [],
      snoozedUntil: null,
      escalationLevel: 0,
      linkedCalendarEventId: null,
      linkedGoalId: body.linkedGoalId ?? null,
      attachments: [],
      sharedWith: [],
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      source: body.source ?? (body.rawInput ? 'manual' : 'manual'),
      isArchived: false,
      rescheduleCount: 0,
      coachingDisabled: false,
      lastCoachingShownAt: null,
    };

    // Write task to Firestore
    await adminDb.doc(`users/${uid}/tasks/${taskId}`).set(task);

    // Auto-breakdown if user has it enabled (runs in background)
    const aiPrefs = userDoc.data()?.aiPreferences;
    if (aiPrefs?.autoBreakdownEnabled) {
      breakTaskIntoSubtasks({ ...task, taskId })
        .then(async (subtasks) => {
          await adminDb.doc(`users/${uid}/tasks/${taskId}`).update({
            subtasks,
            aiBreakdownDone: true,
            updatedAt: FieldValue.serverTimestamp(),
          });
        })
        .catch((err) => {
          console.warn('[POST /api/tasks] Breakdown failed in background', err);
        });
    }

    // Schedule reminders
    await scheduleReminders({ ...task, taskId }, uid);

    // Update user's totalTasksCreated counter
    await adminDb.doc(`users/${uid}`).update({
      totalTasksCreated: FieldValue.increment(1),
    });

    return NextResponse.json({ ...task, taskId }, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/tasks]', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}
