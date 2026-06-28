'use client';
// ─── Tasks React Query Hooks ───────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { useTaskStore } from '@/store/taskStore';
import { useProcrastinationStore } from '@/store/procrastinationStore';
import { useUIStore } from '@/store/uiStore';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types';
import { toast } from 'sonner';

const TASK_KEYS = {
  all: ['tasks'] as const,
  list: (filters?: TaskFilters) => ['tasks', 'list', filters] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

// ─── List tasks (with filters) ─────────────────────────────────────────────────
export function useTaskList(filters?: TaskFilters) {
  const setTasks = useTaskStore(s => s.setTasks);

  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status.join(','));
      if (filters?.category) params.set('category', filters.category.join(','));
      if (filters?.priority) params.set('priority', filters.priority.join(','));
      if (filters?.search) params.set('search', filters.search);

      const tasks = await apiFetch<Task[]>(`/api/tasks?${params.toString()}`);
      setTasks(tasks);
      return tasks;
    },
    staleTime: 30_000, // 30s before refetch
  });
}

// ─── Single task ───────────────────────────────────────────────────────────────
export function useTask(taskId: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(taskId),
    queryFn: () => apiFetch<Task>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

// ─── Create task ───────────────────────────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  const upsertTask = useTaskStore(s => s.upsertTask);

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) }),

    onSuccess: (task) => {
      upsertTask(task); // optimistic update in Zustand
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success('Task created!', { description: task.title });
    },
    onError: (err: Error) => {
      toast.error('Failed to create task', { description: err.message });
    },
  });
}

// ─── Update task ───────────────────────────────────────────────────────────────
export function useUpdateTask() {
  const qc = useQueryClient();
  const upsertTask = useTaskStore(s => s.upsertTask);
  const setCoachingTask = useProcrastinationStore(s => s.setCoachingTask);
  const openModal = useUIStore(s => s.openModal);

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) => {
      // If rescheduling (deadline change), increment rescheduleCount server-side
      const isRescheduling = updates.deadline !== undefined;
      const payload = isRescheduling
        ? { ...updates, rescheduleCount: ((updates as Record<string, unknown>)._currentRescheduleCount as number ?? 0) + 1 }
        : updates;
      // Remove our internal helper key before sending
      delete (payload as Record<string, unknown>)._currentRescheduleCount;
      return apiFetch<Task>(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    },

    onSuccess: (task, { updates }) => {
      upsertTask(task);
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(task.taskId) });
      // Trigger procrastination coach if rescheduled 3+ times
      const count = task.rescheduleCount ?? 0;
      const isRescheduling = updates.deadline !== undefined;
      const coachingDisabled = (task as unknown as Record<string, unknown>).coachingDisabled as boolean;
      if (isRescheduling && count >= 3 && !coachingDisabled) {
        setCoachingTask(task.taskId, task.title, count);
        openModal('procrastination-coach');
      }
    },
    onError: (err: Error) => {
      toast.error('Failed to update task', { description: err.message });
    },
  });
}

// ─── Complete task ─────────────────────────────────────────────────────────────
export function useCompleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      apiFetch<Task>(`/api/tasks/${taskId}/complete`, { method: 'POST' }),

    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      const isBig = task.priority === 'critical' || task.priority === 'high';
      toast.success(isBig ? '🎉 Task completed!' : 'Task completed', {
        description: task.title,
      });
    },
    onError: (err: Error) => {
      toast.error('Failed to complete task', { description: err.message });
    },
  });
}

// ─── Snooze task ───────────────────────────────────────────────────────────────
export function useSnoozeTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, minutes }: { taskId: string; minutes: number }) =>
      apiFetch<Task>(`/api/tasks/${taskId}/snooze`, {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      }),

    onSuccess: (task, { minutes }) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.info(`Snoozed for ${minutes} minutes`, { description: task.title });
    },
  });
}

// ─── Delete task (soft) ────────────────────────────────────────────────────────
export function useDeleteTask() {
  const qc = useQueryClient();
  const removeTask = useTaskStore(s => s.removeTask);

  return useMutation({
    mutationFn: (taskId: string) =>
      apiFetch<void>(`/api/tasks/${taskId}`, { method: 'DELETE' }),

    onSuccess: (_, taskId) => {
      removeTask(taskId); // instantly remove from UI
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success('Task deleted', { description: 'Recoverable for 30 days' });
    },
    onError: (err: Error) => {
      toast.error('Failed to delete task', { description: err.message });
    },
  });
}
