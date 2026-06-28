// ─── Task Zustand Store ────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Task, TaskFilters } from '@/types';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  filters: TaskFilters;
  isQuickAddOpen: boolean;
  viewMode: 'list' | 'board' | 'calendar';

  // Actions
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setSelectedTask: (taskId: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setQuickAddOpen: (open: boolean) => void;
  setViewMode: (mode: 'list' | 'board' | 'calendar') => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      filters: {},
      isQuickAddOpen: false,
      viewMode: 'list',

      setTasks: (tasks) => set({ tasks }),

      // Upsert: update existing or append new (for optimistic updates)
      upsertTask: (task) => {
        const existing = get().tasks.findIndex(t => t.taskId === task.taskId);
        if (existing >= 0) {
          const tasks = [...get().tasks];
          tasks[existing] = task;
          set({ tasks });
        } else {
          set({ tasks: [task, ...get().tasks] });
        }
      },

      removeTask: (taskId) =>
        set({ tasks: get().tasks.filter(t => t.taskId !== taskId) }),

      setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      clearFilters: () => set({ filters: {} }),
      setQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'TaskStore' }
  )
);
