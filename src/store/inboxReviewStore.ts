import { create } from 'zustand';
import { ExtractedTask } from '@/hooks/useGmailIntegration';

interface InboxReviewState {
  isOpen: boolean;
  scannedTasks: ExtractedTask[];
  
  openReview: (tasks: ExtractedTask[]) => void;
  closeReview: () => void;
  removeTask: (emailId: string) => void;
}

export const useInboxReviewStore = create<InboxReviewState>((set) => ({
  isOpen: false,
  scannedTasks: [],

  openReview: (tasks) => set({ isOpen: true, scannedTasks: tasks }),
  closeReview: () => set({ isOpen: false, scannedTasks: [] }),
  removeTask: (emailId) => set(state => ({
    scannedTasks: state.scannedTasks.filter(t => t.sourceEmailId !== emailId)
  })),
}));
