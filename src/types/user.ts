// ─── User Profile, Settings & AI Preferences ─────────────────────────────────
// Stored in Firestore at users/{uid}

export type UserRole = 'student' | 'professional' | 'entrepreneur' | 'other';
export type ThemePreference = 'system' | 'light' | 'dark';
export type DefaultView = 'dashboard' | 'inbox' | 'calendar';
export type EnergyPattern = 'morning' | 'afternoon' | 'evening' | 'night';
export type InsightFrequency = 'daily' | 'weekly' | 'off';
export type ProcrastinationSensitivity = 'low' | 'medium' | 'high';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type WeekStartsOn = 'sunday' | 'monday';

// ─── Notification & UX preferences ───────────────────────────────────────────
export interface UserSettings {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  morningDigestEnabled: boolean;
  morningDigestTime: string; // HH:MM in user's timezone
  weeklyReportEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM e.g. "22:00"
  quietHoursEnd: string;   // HH:MM e.g. "07:00"
  defaultSnooze: 15 | 30 | 60 | 120; // minutes
  soundEnabled: boolean;
  theme: ThemePreference;
  defaultView: DefaultView;
  weekStartsOn: WeekStartsOn;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}

// ─── AI Behaviour preferences ─────────────────────────────────────────────────
export interface AIPreferences {
  defaultPriority: 'critical' | 'high' | 'medium' | 'low';
  preferredWorkHoursStart: string; // HH:MM
  preferredWorkHoursEnd: string;   // HH:MM
  energyPattern: EnergyPattern;
  autoBreakdownEnabled: boolean;  // auto-run subtask breakdown on every new task
  autoScheduleEnabled: boolean;   // auto-create calendar events when slot selected
  agentAutoApprove: boolean[];    // indexed by AgentActionType enum
  procrastinationSensitivity: ProcrastinationSensitivity;
  insightFrequency: InsightFrequency;
}

// ─── Full User Document ───────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  role: UserRole;
  timezone: string; // IANA e.g. Asia/Kolkata
  language: string; // BCP 47 e.g. en-IN
  onboardingCompleted: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  lastActiveAt: Date;

  // Lifetime stats
  totalTasksCreated: number;
  totalTasksCompleted: number;
  totalShipped: number;
  podIds?: string[];
  preferences?: {
    focusDuration: number;
    breakDuration: number;
  };
  currentStreak: number;
  longestStreak: number;
  streakLastUpdatedDate: string; // YYYY-MM-DD — prevents double-counting
  focusScore: number; // 0–100 latest weekly score

  // Calendar integration
  googleCalendarConnected: boolean;
  googleCalendarId: string | null;
  googleRefreshToken: string | null; // encrypted at rest

  // Power tier integrations (stubs)
  notionConnected: boolean;
  notionWorkspaceId: string | null;
  jiraConnected: boolean;
  jiraSiteId: string | null;

  // FCM token for push notifications
  fcmToken: string | null;
  fcmTokens?: string[];
  githubConnected?: boolean;

  settings: UserSettings;
  aiPreferences: AIPreferences;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULT_USER_SETTINGS: UserSettings = {
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  morningDigestEnabled: true,
  morningDigestTime: '08:00',
  weeklyReportEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  defaultSnooze: 30,
  soundEnabled: true,
  theme: 'system',
  defaultView: 'dashboard',
  weekStartsOn: 'monday',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
};

export const DEFAULT_AI_PREFERENCES: AIPreferences = {
  defaultPriority: 'medium',
  preferredWorkHoursStart: '09:00',
  preferredWorkHoursEnd: '18:00',
  energyPattern: 'morning',
  autoBreakdownEnabled: true,
  autoScheduleEnabled: false,
  agentAutoApprove: [],
  procrastinationSensitivity: 'medium',
  insightFrequency: 'weekly',
};
