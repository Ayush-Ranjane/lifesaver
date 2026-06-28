'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MoreHorizontal, Timer, Calendar, Zap, Brain } from 'lucide-react';
import { isPast } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCompleteTask, useSnoozeTask } from '@/hooks/useTasks';
import {
  cn,
  PRIORITY_DOT_COLORS,
  CATEGORY_ICONS,
  formatDeadline,
} from '@/lib/utils';
import type { Task } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { useProcrastinationStore } from '@/store/procrastinationStore';

interface ActiveTaskRowProps {
  task: Task;
}

export function ActiveTaskRow({ task }: ActiveTaskRowProps) {
  const complete = useCompleteTask();
  const snooze = useSnoozeTask();
  const { openModal } = useUIStore();
  const { setCoachingTask } = useProcrastinationStore();
  const isOverdue = isPast(task.deadline) && task.status !== 'completed';
  const isDone = task.status === 'completed';

  return (
    <motion.div
      layout
      className="group flex items-center gap-4 px-6 py-4 transition-all duration-300 hover:bg-[var(--glass-mid)] hover:translate-x-1"
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={() => !isDone && complete.mutate(task.taskId)}
        aria-label={`Mark ${task.title} complete`}
      />

      <div className="min-w-0 flex-1">
        <Link href={`/tasks/${task.taskId}`}>
          <p
            className={cn(
              'truncate text-base font-medium text-text-primary transition-colors hover:text-cyan',
              isDone && 'text-text-tertiary line-through opacity-70'
            )}
          >
            {task.title}
          </p>
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <span className={cn('priority-dot', PRIORITY_DOT_COLORS[task.priority])} />
          <span className={cn('text-xs text-text-tertiary', isOverdue && 'text-accent-red')}>
            {formatDeadline(task.deadline)}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" className="normal-case tracking-wide text-[10px] bg-white/5 border-white/10">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <span className="hidden text-base sm:block">{CATEGORY_ICONS[task.category]}</span>

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!isDone && (
          <>
            <button
              type="button"
              onClick={() => snooze.mutate({ taskId: task.taskId, minutes: 30 })}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-text-primary"
              title="Snooze 30 min"
            >
              <Timer className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCoachingTask(task.taskId, task.title, task.rescheduleCount || 0);
                openModal('procrastination-coach');
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-violet-400"
              title="AI Coach"
            >
              <Brain className="h-3.5 w-3.5" />
            </button>
            <Link
              href={`/focus?taskId=${task.taskId}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-primary"
              title="Focus mode"
            >
              <Zap className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-text-primary"
              title="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        {!isDone && (
          <Link
            href={`/calendar`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-text-primary"
            title="Calendar"
          >
            <Calendar className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
