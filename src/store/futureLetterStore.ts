import { create } from 'zustand';

interface FutureLetterState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useFutureLetterStore = create<FutureLetterState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
