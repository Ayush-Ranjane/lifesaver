// ─── Shared utility functions ──────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';
import type { TaskPriority, TaskStatus, TaskCategory, FocusScore } from '@/types';

// ─── Tailwind class merger ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Priority colors ───────────────────────────────────────────────────────────
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  low:      'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export const PRIORITY_DOT_COLORS: Record<TaskPriority, string> = {
  critical: 'bg-red-400',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-slate-400',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending:     'text-blue-400 bg-blue-400/10',
  in_progress: 'text-violet-400 bg-violet-400/10',
  completed:   'text-emerald-400 bg-emerald-400/10',
  overdue:     'text-red-400 bg-red-400/10',
  snoozed:     'text-amber-400 bg-amber-400/10',
  cancelled:   'text-slate-500 bg-slate-500/10',
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work:     '💼',
  personal: '🏠',
  study:    '📚',
  finance:  '💰',
  health:   '❤️',
  errands:  '🛒',
  other:    '📌',
};

// ─── Deadline formatting ───────────────────────────────────────────────────────
export function formatDeadline(date: Date): string {
  if (isPast(date)) return `Overdue · ${format(date, 'MMM d')}`;
  if (isToday(date)) return `Today · ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d · h:mm a');
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

// ─── Focus score grade colors ─────────────────────────────────────────────────
export function getGradeColor(grade: FocusScore['grade']): string {
  const map: Record<string, string> = {
    A: 'text-emerald-400',
    B: 'text-blue-400',
    C: 'text-yellow-400',
    D: 'text-orange-400',
    F: 'text-red-400',
  };
  return map[grade] ?? 'text-slate-400';
}

// ─── Compute focus score grade from number ────────────────────────────────────
export function scoreToGrade(score: number): FocusScore['grade'] {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Firebase ID token helper ─────────────────────────────────────────────────
// Fetches the current user's ID token for API Authorization headers
import { getAuth } from 'firebase/auth';

export async function getAuthHeader(): Promise<HeadersInit> {
  if (typeof window === 'undefined') return {};
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── API fetch wrapper with auth ──────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (typeof window === 'undefined') {
    // Return a pending promise during SSR to prevent relative URL and auth errors
    return new Promise(() => {}) as unknown as T;
  }
  const headers = await getAuthHeader();
  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  if (typeof window === 'undefined') {
    return new Promise(() => {}) as unknown as Promise<Blob>;
  }
  const headers = await getAuthHeader();
  const res = await fetch(path, { headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API error: ${res.status}`);
  }
  return res.blob();
}

// ─── Debounce utility ─────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Truncate text ────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
