// ─── Barrel export for all type modules ───────────────────────────────────────
// Import everything from one place: import { Task, UserProfile, Goal } from '@/types'

export * from './task';
export * from './user';
export * from './goal';
export * from './habit';
export * from './notification';

// ─── Calendar Slot (used by AI schedule suggestion) ───────────────────────────
export interface CalendarSlot {
  start: Date;
  end: Date;
  durationMinutes: number;
  score: number; // 0–1; higher = better fit
  reason: string; // human-readable explanation for UI
}

// ─── Analytics types ──────────────────────────────────────────────────────────
export interface FocusScore {
  score: number; // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  onTimeCompletionRate: number;
  streakBonus: number;
  overdueReductionRate: number;
  period: 'week' | 'month';
  computedAt: Date;
}

export interface PeakProductivityData {
  hourlyCompletions: number[]; // 24-element array; index = hour (0–23)
  peakHour: number;
  peakDayOfWeek: number; // 0=Sun … 6=Sat
}



export interface WeeklyReportCard {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  focusScore: number;
  tasksCompleted: number;
  tasksOverdue: number;
  onTimeRate: number;
  aiNarrative: string; // 2-3 sentences from Gemini
  recommendation: string;
  weekOf: string; // ISO week string
}

// ─── Agent Action (Power tier) ────────────────────────────────────────────────
export type AgentActionType =
  | 'draft_email'
  | 'create_calendar_event'
  | 'break_task'
  | 'suggest_reschedule'
  | 'send_email';

export interface AgentAction {
  actionId: string;
  userId: string;
  type: AgentActionType;
  description: string;
  payload: Record<string, unknown>;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed';
  createdAt: Date;
  executedAt: Date | null;
  result: string | null;
}

// ─── Onboarding state ─────────────────────────────────────────────────────────
export interface OnboardingState {
  currentStep: number; // 1–7
  displayName: string;
  role: import('./user').UserRole | null;
  painPoints: string[];
  energyPattern: import('./user').EnergyPattern | null;
  calendarConnected: boolean;
  notificationsEnabled: boolean;
  firstTaskRawInput: string;
}
