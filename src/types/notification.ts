// ─── Notification Data Models ──────────────────────────────────────────────────

export type NotificationType =
  | 'reminder'     // scheduled reminder before deadline
  | 'overdue'      // task passed deadline
  | 'escalation'   // escalation level increased
  | 'ai_insight'   // weekly/daily AI insight
  | 'system'       // app-level messages
  | 'team'         // team / collaboration events (Power tier)
  | 'streak'       // streak milestone achieved
  | 'goal';        // goal milestone / check-in prompt

export type NotificationAction = 'complete' | 'snooze' | 'open' | 'dismiss';

// ─── Notification record stored in Firestore ──────────────────────────────────
export interface NotificationRecord {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId: string | null;   // linked task if applicable
  goalId: string | null;
  habitId: string | null;
  isRead: boolean;
  actionTaken: NotificationAction | null; // what the user did with it
  createdAt: Date;
  readAt: Date | null;
  // Deep link to open when notification is clicked
  deepLink: string;
}

// ─── FCM push payload (sent via Firebase Cloud Messaging) ────────────────────
export interface NotificationPayload {
  title: string;
  body: string;
  data: {
    taskId?: string;
    goalId?: string;
    notificationId: string;
    deepLink: string;
  };
}

// ─── Reminder schedule entry (written to Firestore for Cloud Function pickup) ─
export interface ReminderSchedule {
  reminderId: string;
  taskId: string;
  userId: string;
  scheduledFor: Date; // when to fire
  fired: boolean;
  firedAt: Date | null;
}
