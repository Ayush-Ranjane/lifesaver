'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Timer,
  Trash2,
  Zap,
  Pencil,
  Brain,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProcrastinationStore } from '@/store/procrastinationStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  useCompleteTask,
  useDeleteTask,
  useSnoozeTask,
} from '@/hooks/useTasks';
import {
  cn,
  PRIORITY_DOT_COLORS,
  CATEGORY_ICONS,
  formatDeadline,
} from '@/lib/utils';
import type { Task } from '@/types';
import { isPast } from 'date-fns';

interface InboxTaskRowProps {
  task: Task;
  compact?: boolean;
  isSelected?: boolean;
}

export function InboxTaskRow({ task, compact, isSelected = false }: InboxTaskRowProps) {
  const complete = useCompleteTask();
  const del = useDeleteTask();
  const snooze = useSnoozeTask();
  const { openModal } = useUIStore();
  const { setCoachingTask } = useProcrastinationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDone = task.status === 'completed';
  const isOverdue = isPast(task.deadline) && !isDone;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        'group flex items-center gap-4 border-b border-[var(--glass-border)] px-6 py-4 transition-all duration-300 hover:bg-[var(--glass-mid)] hover:translate-x-1',
        isSelected && 'bg-[var(--glass-weak)]'
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={() => !isDone && complete.mutate(task.taskId)}
        aria-label={`Mark ${task.title} complete`}
      />

      <span className={cn('priority-dot flex-shrink-0', PRIORITY_DOT_COLORS[task.priority])} />

      <Link href={`/tasks/${task.taskId}`} className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-base font-medium text-text-primary transition-colors hover:text-cyan',
            isDone && 'text-text-tertiary line-through opacity-70'
          )}
        >
          {task.title}
        </p>
        {!compact && (
          <div className="mt-1 flex items-center gap-3">
            <span className={cn('text-xs text-text-tertiary', isOverdue && 'text-accent-red')}>
              {formatDeadline(task.deadline)}
            </span>
            {task.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="normal-case tracking-wide text-[10px] bg-white/5 border-white/10"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Link>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!isDone && (
          <>
            <button
              type="button"
              onClick={() => snooze.mutate({ taskId: task.taskId, minutes: 30 })}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-text-primary"
              title="Snooze 30 min"
            >
              <Timer className="h-4 w-4" />
            </button>
            <Link
              href={`/focus?taskId=${task.taskId}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-primary"
              title="Focus mode"
            >
              <Zap className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setCoachingTask(task.taskId, task.title, task.rescheduleCount || 0);
                openModal('procrastination-coach');
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-muted hover:text-violet-400"
              title="AI Coach"
            >
              <Brain className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-text-tertiary hover:bg-surface-3 hover:text-text-primary"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 min-w-[140px] rounded-sm border border-border bg-surface-2 py-1 shadow-elevation-2">
              <Link
                href={`/tasks/${task.taskId}`}
                className="flex w-full items-center gap-2 px-3 py-2 text-body-m text-text-secondary hover:bg-surface-3 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => {
                  del.mutate(task.taskId);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-body-m text-critical hover:bg-critical/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
