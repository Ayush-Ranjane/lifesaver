import type { Task, PeakProductivityData, FocusScore } from '@/types';

export interface AIInsight {
  narrative: string;
  recommendation: string;
  generatedAt: Date;
}

export async function generateAIInsight(
  userId: string,
  tasks: Task[],
  focusScore: FocusScore,
  peakData: PeakProductivityData
): Promise<AIInsight> {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const peakHourLabel = peakData.peakHour === 0 ? 'midnight' : `${peakData.peakHour}:00`;

  return {
    narrative: `You completed ${completedTasks.length} tasks this week with a ${Math.round(focusScore.onTimeCompletionRate * 100)}% on-time rate. Your focus score is ${focusScore.score}/100.`,
    recommendation: `Try scheduling your most important tasks around ${peakHourLabel}, your current peak productivity hour.`,
    generatedAt: new Date(),
  };
}
