// ─── Firestore Data Converters ─────────────────────────────────────────────────
// Converts Firestore Timestamps ↔ JS Dates for type-safe reads/writes.
// Usage: db.collection('tasks').withConverter(taskConverter)

import {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Task, UserProfile, Goal, Habit, NotificationRecord } from '@/types';

// ─── Timestamp conversion utilities ───────────────────────────────────────────
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
}

function toDateOrNull(value: unknown): Date | null {
  if (value == null) return null;
  return toDate(value);
}

// Recursively convert Date objects to Firestore Timestamps for writes
function datesToTimestamps(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v instanceof Date) return [k, Timestamp.fromDate(v)];
      if (Array.isArray(v)) return [k, v.map(item =>
        typeof item === 'object' && item !== null
          ? datesToTimestamps(item as Record<string, unknown>)
          : item
      )];
      if (typeof v === 'object' && v !== null && !(v instanceof Timestamp))
        return [k, datesToTimestamps(v as Record<string, unknown>)];
      return [k, v];
    })
  );
}

// ─── Task Converter ────────────────────────────────────────────────────────────
export const taskConverter: FirestoreDataConverter<Task> = {
  toFirestore(task: Task): DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { taskId, ...rest } = task;
    return datesToTimestamps(rest as Record<string, unknown>);
  },
  fromFirestore(snap: QueryDocumentSnapshot): Task {
    const d = snap.data();
    return {
      ...d,
      taskId: snap.id,
      deadline: toDate(d.deadline),
      scheduledStart: toDateOrNull(d.scheduledStart),
      snoozedUntil: toDateOrNull(d.snoozedUntil),
      completedAt: toDateOrNull(d.completedAt),
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
      subtasks: (d.subtasks ?? []).map((s: DocumentData) => ({
        ...s,
        completedAt: toDateOrNull(s.completedAt),
      })),
      attachments: (d.attachments ?? []).map((a: DocumentData) => ({
        ...a,
        uploadedAt: toDate(a.uploadedAt),
      })),
      recurrence: d.recurrence
        ? {
            ...d.recurrence,
            endDate: toDateOrNull(d.recurrence.endDate),
            nextOccurrence: toDate(d.recurrence.nextOccurrence),
          }
        : null,
    } as Task;
  },
};

// ─── User Converter ────────────────────────────────────────────────────────────
export const userConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(user: UserProfile): DocumentData {
    const { uid, ...rest } = user;
    void uid;
    return datesToTimestamps(rest as Record<string, unknown>);
  },
  fromFirestore(snap: QueryDocumentSnapshot): UserProfile {
    const d = snap.data();
    return {
      ...d,
      uid: snap.id,
      createdAt: toDate(d.createdAt),
      lastLoginAt: toDate(d.lastLoginAt),
      lastActiveAt: toDate(d.lastActiveAt),
    } as UserProfile;
  },
};

// ─── Goal Converter ────────────────────────────────────────────────────────────
export const goalConverter: FirestoreDataConverter<Goal> = {
  toFirestore(goal: Goal): DocumentData {
    const { goalId, ...rest } = goal;
    void goalId;
    return datesToTimestamps(rest as Record<string, unknown>);
  },
  fromFirestore(snap: QueryDocumentSnapshot): Goal {
    const d = snap.data();
    return {
      ...d,
      goalId: snap.id,
      startDate: toDate(d.startDate),
      targetDate: toDate(d.targetDate),
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
      milestones: (d.milestones ?? []).map((m: DocumentData) => ({
        ...m,
        targetDate: toDate(m.targetDate),
        completedAt: toDateOrNull(m.completedAt),
      })),
    } as Goal;
  },
};

// ─── Habit Converter ───────────────────────────────────────────────────────────
export const habitConverter: FirestoreDataConverter<Habit> = {
  toFirestore(habit: Habit): DocumentData {
    const { habitId, ...rest } = habit;
    void habitId;
    return datesToTimestamps(rest as Record<string, unknown>);
  },
  fromFirestore(snap: QueryDocumentSnapshot): Habit {
    const d = snap.data();
    return {
      ...d,
      habitId: snap.id,
      pausedUntil: toDateOrNull(d.pausedUntil),
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
      entries: (d.entries ?? []).map((e: DocumentData) => ({
        ...e,
        completedAt: toDate(e.completedAt),
      })),
    } as Habit;
  },
};

// ─── Notification Converter ────────────────────────────────────────────────────
export const notificationConverter: FirestoreDataConverter<NotificationRecord> = {
  toFirestore(n: NotificationRecord): DocumentData {
    const { notificationId, ...rest } = n;
    void notificationId;
    return datesToTimestamps(rest as Record<string, unknown>);
  },
  fromFirestore(snap: QueryDocumentSnapshot): NotificationRecord {
    const d = snap.data();
    return {
      ...d,
      notificationId: snap.id,
      createdAt: toDate(d.createdAt),
      readAt: toDateOrNull(d.readAt),
    } as NotificationRecord;
  },
};
