// ─── UI / Modal Zustand Store ──────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModalType =
  | 'task-create'
  | 'task-edit'
  | 'task-detail'
  | 'slot-picker'
  | 'goal-create'
  | 'habit-create'
  | 'confirm-delete'
  | 'procrastination-coach'
  | null;

interface UIState {
  // Modal control
  activeModal: ModalType;
  modalPayload: Record<string, unknown> | null; // context data passed to modal

  // Layout
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;

  // Focus mode
  isFocusMode: boolean;
  focusTaskId: string | null;

  // Ambient sound (Focus Mode)
  ambientSoundProfile: string;
  ambientSoundVolume: number;

  // Actions
  openModal: (modal: ModalType, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  startFocusMode: (taskId: string) => void;
  endFocusMode: () => void;
  setAmbientSoundProfile: (profile: string) => void;
  setAmbientSoundVolume: (volume: number) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      activeModal: null,
      modalPayload: null,
      isSidebarCollapsed: false,
      isMobileNavOpen: false,
      isFocusMode: false,
      focusTaskId: null,
      ambientSoundProfile: 'deep-work',
      ambientSoundVolume: 0.4,

      openModal: (modal, payload) =>
        set({ activeModal: modal, modalPayload: payload ?? null }),
      closeModal: () =>
        set({ activeModal: null, modalPayload: null }),
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setMobileNav: (open) =>
        set({ isMobileNavOpen: open }),
      startFocusMode: (taskId) =>
        set({ isFocusMode: true, focusTaskId: taskId }),
      endFocusMode: () =>
        set({ isFocusMode: false, focusTaskId: null }),
      setAmbientSoundProfile: (profile) =>
        set({ ambientSoundProfile: profile }),
      setAmbientSoundVolume: (volume) =>
        set({ ambientSoundVolume: volume }),
    }),
    { name: 'UIStore' }
  )
);
