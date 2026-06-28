// ─── Task & Subtask Data Models ───────────────────────────────────────────────
// Mirrors the Firestore schema exactly. All Date fields stored as Firestore
// Timestamps on the server; converted to JS Date on the client via converters.

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'snoozed' | 'cancelled';
export type TaskEffort = 'quick' | 'short' | 'deep'; // <15min / <1hr / >1hr
export type TaskCategory = 'work' | 'personal' | 'study' | 'finance' | 'health' | 'errands' | 'other';
export type TaskSource = 'manual' | 'voice' | 'email' | 'calendar' | 'agent' | 'github';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type EscalationLevel = 0 | 1 | 2 | 3;

// ─── Subtask ──────────────────────────────────────────────────────────────────
export interface SubTask {
  subtaskId: string;
  title: string;
  estimatedMinutes: number;
  order: number;
  status: 'pending' | 'done';
  completedAt: Date | null;
}

// ─── Recurrence Rule ──────────────────────────────────────────────────────────
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g. interval:2 + weekly = every 2 weeks
  daysOfWeek: number[]; // 0=Sun … 6=Sat; only for weekly
  endDate: Date | null;
  maxOccurrences: number | null;
  nextOccurrence: Date; // pre-computed for efficient Firestore queries
}

// ─── Attachment ───────────────────────────────────────────────────────────────
export interface Attachment {
  name: string;
  url: string; // Firebase Storage signed URL
  size: number; // bytes
  uploadedAt: Date;
}

// ─── Task (main document) ─────────────────────────────────────────────────────
export interface Task {
  taskId: string;
  userId: string;

  // Core fields
  title: string; // max 200 chars
  description: string; // max 2000 chars
  rawInput: string; // original voice/text before AI parse
  deadline: Date;
  deadlineTimezone: string; // IANA e.g. Asia/Kolkata
  priority: TaskPriority;
  status: TaskStatus;
  effort: TaskEffort;
  category: TaskCategory;
  tags: string[]; // max 10

  // AI enrichment
  subtasks: SubTask[];
  aiBreakdownDone: boolean;
  estimatedMinutes: number;
  actualMinutes: number | null;
  aiConfidenceScore: number; // 0–1

  // Scheduling
  scheduledStart: Date | null;
  recurrence: RecurrenceRule | null;
  remindersSent: number[]; // Unix timestamps of fired reminders
  snoozedUntil: Date | null;
  escalationLevel: EscalationLevel;

  // Integrations
  linkedCalendarEventId: string | null;
  linkedGoalId: string | null;

  // Attachments & collaboration
  attachments: Attachment[];
  sharedWith: string[]; // UIDs (Power tier)

  // Lifecycle timestamps
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Metadata
  source: TaskSource;
  isArchived: boolean;
  rescheduleCount: number;       // increments each time deadline is pushed
  coachingDisabled: boolean;     // user opted out of procrastination coaching
  lastCoachingShownAt: Date | null; // prevents showing coaching twice/day
  calendarEventId?: string;      // ID of the Google Calendar event
}

// ─── Input Types (for create / update API calls) ──────────────────────────────
export interface CreateTaskInput {
  rawInput?: string; // natural language — triggers AI parse
  title?: string; // direct override (skips AI)
  description?: string;
  deadline?: Date | string;
  priority?: TaskPriority;
  category?: TaskCategory;
  effort?: TaskEffort;
  tags?: string[];
  linkedGoalId?: string;
  recurrence?: RecurrenceRule;
  source?: TaskSource;
}

export type UpdateTaskInput = Partial<Omit<Task, 'taskId' | 'userId' | 'createdAt'>>;

// ─── Filters for search / list queries ───────────────────────────────────────
export interface TaskFilters {
  status?: TaskStatus[];
  category?: TaskCategory[];
  priority?: TaskPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  search?: string;
}

// ─── AI Parse Result ──────────────────────────────────────────────────────────
export interface AIParseResult {
  title: string;
  deadline: Date | null;
  deadlineTimezone: string;
  priority: TaskPriority;
  category: TaskCategory;
  effort: TaskEffort;
  estimatedMinutes: number;
  confidence: number; // 0–1
  tags: string[];
}
