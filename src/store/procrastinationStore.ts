// ─── Procrastination Coach Zustand Store ──────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CoachingAIPlan {
  validation: string;
  steps: [string, string, string];
  closing: string;
}

interface ProcrastinationState {
  coachingTaskId: string | null;
  coachingTaskTitle: string;
  rescheduleCount: number;
  step: 0 | 1 | 2 | 3 | 4;
  answers: string[];
  aiActionPlan: CoachingAIPlan | null;
  isLoading: boolean;

  setCoachingTask: (taskId: string, title: string, rescheduleCount: number) => void;
  nextStep: (answer?: string) => void;
  setActionPlan: (plan: CoachingAIPlan) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useProcrastinationStore = create<ProcrastinationState>()(
  devtools(
    (set, get) => ({
      coachingTaskId: null,
      coachingTaskTitle: '',
      rescheduleCount: 0,
      step: 0,
      answers: [],
      aiActionPlan: null,
      isLoading: false,

      setCoachingTask: (taskId, title, rescheduleCount) =>
        set({ coachingTaskId: taskId, coachingTaskTitle: title, rescheduleCount, step: 0, answers: [], aiActionPlan: null }),

      nextStep: (answer) => {
        const { step, answers } = get();
        const newAnswers = answer !== undefined ? [...answers, answer] : answers;
        set({ step: (step + 1) as ProcrastinationState['step'], answers: newAnswers });
      },

      setActionPlan: (plan) => set({ aiActionPlan: plan, step: 4, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      reset: () => set({ coachingTaskId: null, coachingTaskTitle: '', rescheduleCount: 0, step: 0, answers: [], aiActionPlan: null, isLoading: false }),
    }),
    { name: 'ProcrastinationStore' }
  )
);
