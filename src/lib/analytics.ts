// ─── Analytics computation functions ──────────────────────────────────────────
// Pure functions — no AI, no network. Fast client-side computation.

import type { Task, FocusScore, PeakProductivityData, WeeklyReportCard } from '@/types';
import { scoreToGrade } from '@/lib/utils';
import { startOfWeek, endOfWeek, isWithinInterval, getHours, getDay } from 'date-fns';

// ─── Focus Score ───────────────────────────────────────────────────────────────
export function computeFocusScore(
  tasks: Task[],
  currentStreak: number,
  period: 'week' | 'month' = 'week'
): FocusScore {
  const now = new Date();
  const rangeStart = period === 'week'
    ? startOfWeek(now, { weekStartsOn: 1 })
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const inRange = tasks.filter(t =>
    t.deadline >= rangeStart && t.deadline <= now
  );

  const completed = inRange.filter(t => t.status === 'completed');
  const onTime = completed.filter(t =>
    t.completedAt && t.deadline && t.completedAt <= t.deadline
  );

  const totalDue = inRange.length;
  const onTimeCompletionRate = totalDue > 0 ? onTime.length / totalDue : 0;

  // Streak bonus: normalized at 30-day streak = 1.0
  const streakBonus = Math.min(currentStreak / 30, 1);

  // Overdue reduction: compare overdue rate this period vs. all time
  const allOverdue = tasks.filter(t => t.status === 'overdue').length;
  const periodOverdue = inRange.filter(t => t.status === 'overdue').length;
  const overdueReductionRate = allOverdue > 0
    ? Math.max(0, 1 - periodOverdue / allOverdue)
    : 1;

  const score = Math.round(
    (onTimeCompletionRate * 0.5 + streakBonus * 0.3 + overdueReductionRate * 0.2) * 100
  );

  return {
    score,
    grade: scoreToGrade(score),
    onTimeCompletionRate,
    streakBonus,
    overdueReductionRate,
    period,
    computedAt: now,
  };
}

// ─── Peak Productivity Hours ───────────────────────────────────────────────────
export function getPeakProductivityHours(tasks: Task[]): PeakProductivityData {
  const hourlyCompletions = new Array(24).fill(0);
  const dailyCompletions = new Array(7).fill(0);

  for (const task of tasks) {
    if (task.status === 'completed' && task.completedAt) {
      const hour = getHours(task.completedAt);
      const day = getDay(task.completedAt);
      hourlyCompletions[hour]++;
      dailyCompletions[day]++;
    }
  }

  const peakHour = hourlyCompletions.indexOf(Math.max(...hourlyCompletions));
  const peakDayOfWeek = dailyCompletions.indexOf(Math.max(...dailyCompletions));

  return { hourlyCompletions, peakHour, peakDayOfWeek };
}

// ─── Weekly Report Card ────────────────────────────────────────────────────────
export function computeWeeklyReport(
  tasks: Task[],
  currentStreak: number,
  aiNarrative: string,
  recommendation: string
): WeeklyReportCard {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeek = tasks.filter(t =>
    isWithinInterval(t.deadline, { start: weekStart, end: weekEnd })
  );

  const completed = thisWeek.filter(t => t.status === 'completed');
  const overdue = thisWeek.filter(t => t.status === 'overdue');
  const onTime = completed.filter(t =>
    t.completedAt && t.deadline && t.completedAt <= t.deadline
  );

  const onTimeRate = thisWeek.length > 0 ? onTime.length / thisWeek.length : 0;
  const focusScore = computeFocusScore(tasks, currentStreak, 'week');

  return {
    grade: focusScore.grade,
    focusScore: focusScore.score,
    tasksCompleted: completed.length,
    tasksOverdue: overdue.length,
    onTimeRate,
    aiNarrative,
    recommendation,
    weekOf: weekStart.toISOString().split('T')[0],
  };
}
