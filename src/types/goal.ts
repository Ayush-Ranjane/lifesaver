// ─── Goal & Milestone Data Models ─────────────────────────────────────────────

export type GoalType = 'career' | 'health' | 'learning' | 'finance' | 'personal' | 'other';
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';
export type GoalDuration = 30 | 60 | 90; // days

// ─── Weekly Milestone ─────────────────────────────────────────────────────────
export interface Milestone {
  milestoneId: string;
  weekNumber: number; // 1-indexed week within goal duration
  title: string;
  description: string;
  targetDate: Date;
  linkedTaskIds: string[]; // tasks auto-generated for this milestone
  isCompleted: boolean;
  completedAt: Date | null;
}

// ─── Weekly Check-in ──────────────────────────────────────────────────────────
export interface CheckInResponse {
  checkInId: string;
  weekNumber: number;
  answeredAt: Date;
  // AI asks 3 structured questions; responses stored here
  answers: { question: string; answer: string }[];
  aiAssessment: string; // AI's 1-2 sentence summary of progress
  onTrack: boolean;
  suggestedAdjustments: string[]; // if behind, AI reprioritization suggestions
}

// ─── Goal Document ────────────────────────────────────────────────────────────
export interface Goal {
  goalId: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  durationDays: GoalDuration;
  startDate: Date;
  targetDate: Date; // startDate + durationDays
  milestones: Milestone[];
  checkIns: CheckInResponse[];
  linkedTaskIds: string[]; // all tasks (across milestones) contributing to goal
  progressPercent: number; // 0–100; recomputed as tasks complete
  createdAt: Date;
  updatedAt: Date;
}

// ─── Input for goal creation ──────────────────────────────────────────────────
export interface CreateGoalInput {
  title: string;
  description?: string;
  type: GoalType;
  durationDays: GoalDuration;
}
