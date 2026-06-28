import type { Milestone, CreateGoalInput } from '@/types';
import { addWeeks, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export async function breakGoalIntoMilestones(
  input: CreateGoalInput,
  startDate: Date
): Promise<Milestone[]> {
  const totalWeeks = Math.ceil(input.durationDays / 7);
  const weeksPerMilestone = Math.ceil(totalWeeks / 4);

  return Array.from({ length: 4 }, (_, i) => ({
    milestoneId: uuidv4(),
    weekNumber: (i + 1) * weeksPerMilestone,
    title: `Phase ${i + 1}: ${['Planning', 'Execution', 'Review', 'Completion'][i]}`,
    description: `Work towards your goal during weeks ${i * weeksPerMilestone + 1}–${(i + 1) * weeksPerMilestone}`,
    targetDate: startOfDay(addWeeks(startDate, (i + 1) * weeksPerMilestone)),
    linkedTaskIds: [],
    isCompleted: false,
    completedAt: null,
  }));
}
