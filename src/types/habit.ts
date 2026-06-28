// ─── Habit & Streak Data Models ────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly';
export type HabitCategory = 'health' | 'study' | 'work' | 'personal' | 'finance' | 'other';

// ─── Individual completion entry ───────────────────────────────────────────────
export interface HabitEntry {
  entryId: string;
  date: string; // YYYY-MM-DD
  completedAt: Date;
}

// ─── Habit Document ────────────────────────────────────────────────────────────
export interface Habit {
  habitId: string;
  userId: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  // For weekly habits: which days (0=Sun…6=Sat)
  targetDaysOfWeek: number[];
  reminderTime: string | null; // HH:MM; null if no daily reminder
  category: HabitCategory;

  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  streakLastUpdatedDate: string; // YYYY-MM-DD

  // Pause support: suspend up to 3 days without streak loss
  isPaused: boolean;
  pausedUntil: Date | null;
  pauseCount: number; // reset each month; max 3 pauses allowed

  // Completion log (last 90 days kept for heatmap)
  entries: HabitEntry[];

  // Milestones celebrated (7/30/100 days)
  milestonesReached: number[];

  createdAt: Date;
  updatedAt: Date;
}

// ─── Input for habit creation ─────────────────────────────────────────────────
export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetDaysOfWeek?: number[];
  reminderTime?: string;
  category?: HabitCategory;
}

// ─── Heatmap data (derived, not stored) ──────────────────────────────────────
export interface HabitHeatmapEntry {
  date: string; // YYYY-MM-DD
  count: number; // 0 or 1 for habits
}
