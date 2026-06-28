// ─── Reminder Scheduling Utility ─────────────────────────────────────────────
// Writes reminder records to Firestore — Cloud Function reads and fires them.
// Falls back gracefully if Firestore write fails (reminders are best-effort).

import { adminDb } from '@/lib/firebase/admin';
import type { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { subHours, subMinutes, isBefore } from 'date-fns';

interface ReminderTime {
  at: Date;
  label: string;
}

// ─── Compute reminder timestamps based on task effort ─────────────────────────
function computeReminderTimes(task: Task): ReminderTime[] {
  const { deadline, effort } = task;
  const now = new Date();

  const candidates: ReminderTime[] =
    effort === 'deep'
      ? [
          { at: subHours(deadline, 24), label: '24h before' },
          { at: subHours(deadline, 4),  label: '4h before' },
          { at: subHours(deadline, 1),  label: '1h before' },
        ]
      : effort === 'short'
      ? [
          { at: subHours(deadline, 2),  label: '2h before' },
          { at: subMinutes(deadline, 30), label: '30min before' },
        ]
      : [
          { at: subMinutes(deadline, 30), label: '30min before' },
          { at: subMinutes(deadline, 15), label: '15min before' },
        ];

  // Only schedule reminders that are in the future
  return candidates.filter(r => isBefore(now, r.at));
}

// ─── Write reminder documents to Firestore ────────────────────────────────────
export async function scheduleReminders(task: Task, userId: string): Promise<void> {
  const reminderTimes = computeReminderTimes(task);

  if (reminderTimes.length === 0) return; // deadline already passed

  const batch = adminDb.batch();

  for (const reminder of reminderTimes) {
    const reminderId = uuidv4();
    const ref = adminDb.doc(`users/${userId}/reminders/${reminderId}`);
    batch.set(ref, {
      reminderId,
      taskId: task.taskId,
      userId,
      taskTitle: task.title,
      scheduledFor: reminder.at,
      label: reminder.label,
      fired: false,
      firedAt: null,
      createdAt: new Date(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    // Non-fatal — log but don't block task creation
    console.error('[scheduleReminders] Batch write failed:', error);
  }
}

// ─── Cancel all pending reminders for a task ──────────────────────────────────
export async function cancelReminders(taskId: string, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection(`users/${userId}/reminders`)
      .where('taskId', '==', taskId)
      .where('fired', '==', false)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  } catch (error) {
    console.error('[cancelReminders] Failed:', error);
  }
}
