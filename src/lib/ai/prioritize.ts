// ─── Today's Focus Prioritization ─────────────────────────────────────────────
// Scores all pending tasks and returns the top 3 for the Dashboard's Today's Focus section.
// Pure computation — no AI call needed; uses deterministic scoring for reliability.

import type { Task, UserProfile } from '@/types';
import { differenceInHours, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

export interface ScoredTask {
  task: Task;
  score: number;
  reason: string; // human-readable explanation shown in UI
}

// ─── Priority weight map ───────────────────────────────────────────────────────
const PRIORITY_WEIGHTS: Record<Task['priority'], number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
};

// ─── Effort-to-energy mapping ──────────────────────────────────────────────────
// Matches task effort to user's current energy level by hour of day.
// e.g. if it's 9am and user's energy pattern is 'morning', 'deep' tasks score higher.
function getEffortFitScore(task: Task, profile: UserProfile): number {
  const hour = new Date().getHours();
  const energy = profile.aiPreferences.energyPattern;

  const isPeakHour =
    (energy === 'morning' && hour >= 7 && hour < 12) ||
    (energy === 'afternoon' && hour >= 12 && hour < 17) ||
    (energy === 'evening' && hour >= 17 && hour < 21) ||
    (energy === 'night' && hour >= 21);

  if (isPeakHour && task.effort === 'deep') return 15;
  if (!isPeakHour && task.effort === 'quick') return 10;
  return 5;
}

// ─── Urgency score: exponential increase as deadline approaches ────────────────
function getUrgencyScore(task: Task): number {
  const hoursUntilDeadline = differenceInHours(task.deadline, new Date());

  if (hoursUntilDeadline < 0) return 50;   // overdue — always highest urgency
  if (hoursUntilDeadline < 2) return 40;
  if (hoursUntilDeadline < 6) return 30;
  if (hoursUntilDeadline < 24) return 20;
  if (hoursUntilDeadline < 72) return 10;
  return 5;
}

// ─── Build human-readable reason string ───────────────────────────────────────
function buildReason(task: Task, urgency: number): string {
  const hours = differenceInHours(task.deadline, new Date());
  if (hours < 0) return 'This task is overdue';
  if (hours < 2) return 'Due in less than 2 hours';
  if (hours < 24) return 'Due today';
  if (urgency >= 30) return `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`;
  return 'Scheduled for this week';
}

// ─── Main prioritization function ─────────────────────────────────────────────
export function prioritizeTasksForToday(
  tasks: Task[],
  profile: UserProfile
): ScoredTask[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Only consider active, non-archived tasks
  const eligible = tasks.filter(
    t => !t.isArchived &&
    ['pending', 'in_progress', 'overdue', 'snoozed'].includes(t.status)
  );

  const scored: ScoredTask[] = eligible.map(task => {
    const urgency = getUrgencyScore(task);
    const priority = PRIORITY_WEIGHTS[task.priority];
    const effortFit = getEffortFitScore(task, profile);

    // Bonus: tasks scheduled for today
    const scheduledToday =
      task.scheduledStart &&
      isAfter(task.scheduledStart, todayStart) &&
      isBefore(task.scheduledStart, todayEnd)
        ? 10 : 0;

    const score = urgency + priority + effortFit + scheduledToday;
    return { task, score, reason: buildReason(task, urgency) };
  });

  // Sort descending, then ensure category diversity in top 3
  scored.sort((a, b) => b.score - a.score);
  const top3 = diversifyTop3(scored);

  return top3;
}

// ─── Category balancer: avoid 3 tasks from the same category ──────────────────
function diversifyTop3(scored: ScoredTask[]): ScoredTask[] {
  const result: ScoredTask[] = [];
  const usedCategories = new Set<string>();

  for (const item of scored) {
    if (result.length >= 3) break;

    // Allow at most 2 tasks from the same category in top 3
    const categoryCount = result.filter(r => r.task.category === item.task.category).length;
    if (categoryCount < 2) {
      result.push(item);
      usedCategories.add(item.task.category);
    }
  }

  // If we don't have 3 yet, fill from remaining without category constraint
  if (result.length < 3) {
    const resultIds = new Set(result.map(r => r.task.taskId));
    for (const item of scored) {
      if (result.length >= 3) break;
      if (!resultIds.has(item.task.taskId)) result.push(item);
    }
  }

  return result;
}
