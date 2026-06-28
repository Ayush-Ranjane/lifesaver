'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Target } from 'lucide-react';
import { useTaskList } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface FocusTaskSelectorProps {
  taskId: string;
  onSelect: (id: string) => void;
  dimmed?: boolean;
}

export function FocusTaskSelector({ taskId, onSelect, dimmed }: FocusTaskSelectorProps) {
  const { data: tasks = [] } = useTaskList();
  const activeTasks = tasks.filter(
    (t) => !t.isArchived && t.status !== 'completed' && t.status !== 'cancelled'
  );
  const selected = activeTasks.find((t) => t.taskId === taskId);

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md transition-opacity duration-500',
        dimmed && 'opacity-20'
      )}
    >
      <label className="type-caption mb-2 block text-center text-text-tertiary">
        Focus task
      </label>
      <div className="relative">
        <Target className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-tertiary" />
        <select
          value={taskId}
          onChange={(e) => onSelect(e.target.value)}
          className={cn(
            'h-input w-full appearance-none rounded-sm border border-white/[0.08] bg-surface-2/40 pl-11 pr-10',
            'text-body-m text-text-primary backdrop-blur-glass',
            'transition-all duration-normal focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20'
          )}
        >
          <option value="">Free focus — no task selected</option>
          {activeTasks.map((task) => (
            <option key={task.taskId} value={task.taskId}>
              {task.title}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      </div>
      {selected && (
        <p className="type-body-m mt-2 text-center text-text-secondary">
          {selected.priority} priority · {selected.effort} effort
        </p>
      )}
    </div>
  );
}

/** Syncs taskId to URL query param */
export function useFocusTaskId() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId') ?? '';

  const setTaskId = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('taskId', id);
    else params.delete('taskId');
    router.replace(`/focus?${params.toString()}`, { scroll: false });
  };

  return { taskId, setTaskId };
}
