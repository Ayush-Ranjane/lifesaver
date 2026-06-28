// ─── Optimal Schedule Slot Suggestion ─────────────────────────────────────────
// Finds the best calendar slot for a task based on free time, user energy,
// and proximity to deadline.

import type { Task, CalendarSlot, UserProfile } from '@/types';
import {
  addMinutes, differenceInHours, format, isBefore, isAfter,
  parseISO, addDays,
} from 'date-fns';

// Google Calendar event shape (minimal fields we need)
export interface CalendarEvent {
  start: string; // ISO 8601
  end: string;
}

// ─── Find free blocks in a list of calendar events ────────────────────────────
function findFreeBlocks(
  events: CalendarEvent[],
  dayStart: Date,
  dayEnd: Date,
  minDurationMinutes: number
): Array<{ start: Date; end: Date }> {
  const sorted = [...events]
    .map(e => ({ start: parseISO(e.start), end: parseISO(e.end) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const freeBlocks: Array<{ start: Date; end: Date }> = [];
  let cursor = dayStart;

  for (const event of sorted) {
    if (isAfter(event.start, cursor)) {
      const gapStart = cursor;
      const gapEnd = event.start;
      const gapMinutes = differenceInHours(gapEnd, gapStart) * 60;
      if (gapMinutes >= minDurationMinutes) {
        freeBlocks.push({ start: gapStart, end: gapEnd });
      }
    }
    if (isAfter(event.end, cursor)) cursor = event.end;
  }

  // Block after last event
  if (isBefore(cursor, dayEnd)) {
    const gapMinutes = differenceInHours(dayEnd, cursor) * 60;
    if (gapMinutes >= minDurationMinutes) {
      freeBlocks.push({ start: cursor, end: dayEnd });
    }
  }

  return freeBlocks;
}

// ─── Score a time slot ────────────────────────────────────────────────────────
function scoreSlot(slot: { start: Date }, task: Task, profile: UserProfile): number {
  let score = 0;
  const hour = slot.start.getHours();
  const energy = profile.aiPreferences.energyPattern;

  // Energy alignment bonus
  const energyHourMap: Record<string, [number, number]> = {
    morning: [7, 12],
    afternoon: [12, 17],
    evening: [17, 21],
    night: [21, 24],
  };
  const [start, end] = energyHourMap[energy] ?? [9, 17];
  if (hour >= start && hour < end) score += 30;

  // Proximity to deadline: closer deadline = prefer sooner slots
  const hoursUntilDeadline = differenceInHours(task.deadline, slot.start);
  if (hoursUntilDeadline > 0 && hoursUntilDeadline < 48) score += 20;
  else if (hoursUntilDeadline >= 48) score += 10;

  // Work hours alignment
  const workStart = parseInt(profile.aiPreferences.preferredWorkHoursStart.split(':')[0]);
  const workEnd = parseInt(profile.aiPreferences.preferredWorkHoursEnd.split(':')[0]);
  if (hour >= workStart && hour < workEnd) score += 20;

  return score;
}

// ─── Main suggestion function ──────────────────────────────────────────────────
export function suggestOptimalScheduleSlot(
  task: Task,
  calendarEvents: CalendarEvent[],
  profile: UserProfile,
  lookAheadDays: number = 7
): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const now = new Date();
  const workStartHour = parseInt(profile.aiPreferences.preferredWorkHoursStart.split(':')[0]);
  const workEndHour = parseInt(profile.aiPreferences.preferredWorkHoursEnd.split(':')[0]);

  for (let dayOffset = 0; dayOffset < lookAheadDays; dayOffset++) {
    const day = addDays(now, dayOffset);
    const dayStart = new Date(day.setHours(workStartHour, 0, 0, 0));
    const dayEnd = new Date(day.setHours(workEndHour, 0, 0, 0));

    // Don't suggest slots after the deadline
    if (isBefore(task.deadline, dayStart)) break;

    const dayEvents = calendarEvents.filter(e => {
      const eventDate = parseISO(e.start);
      return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    const freeBlocks = findFreeBlocks(dayEvents, dayStart, dayEnd, task.estimatedMinutes);

    for (const block of freeBlocks) {
      const slotEnd = addMinutes(block.start, task.estimatedMinutes);
      if (isAfter(slotEnd, block.end)) continue; // block too small

      const score = scoreSlot(block, task, profile);
      slots.push({
        start: block.start,
        end: slotEnd,
        durationMinutes: task.estimatedMinutes,
        score: Math.min(score / 70, 1), // normalize to 0-1
        reason: score > 40
          ? 'Aligns with your peak energy and work hours'
          : 'Available slot within your schedule',
      });
    }
  }

  // Return top 3 slots sorted by score descending
  return slots.sort((a, b) => b.score - a.score).slice(0, 3);
}
