'use client';

import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InboxTaskRow } from './InboxTaskRow';
import type { Task } from '@/types';

export type InboxGroupKey = 'overdue' | 'today' | 'upcoming' | 'completed';

const GROUP_CONFIG: Record<
  InboxGroupKey,
  { label: string; headerClass: string; labelClass: string }
> = {
  overdue: {
    label: 'Overdue',
    headerClass: 'border-critical/20 bg-critical/5',
    labelClass: 'text-critical',
  },
  today: {
    label: 'Due Today',
    headerClass: 'border-cyan/20 bg-cyan/5',
    labelClass: 'text-cyan',
  },
  upcoming: {
    label: 'Upcoming',
    headerClass: 'border-border bg-surface-1/50',
    labelClass: 'text-text-secondary',
  },
  completed: {
    label: 'Completed',
    headerClass: 'border-border bg-surface-1/30',
    labelClass: 'text-text-tertiary',
  },
};

const GROUP_ORDER: InboxGroupKey[] = ['overdue', 'today', 'upcoming', 'completed'];

interface InboxTaskListProps {
  groups: Record<InboxGroupKey, Task[]>;
}

export function InboxTaskList({ groups }: InboxTaskListProps) {
  return (
    <div className="space-y-6">
      {GROUP_ORDER.map((key) => {
        const tasks = groups[key];
        if (!tasks.length) return null;
        const config = GROUP_CONFIG[key];

        return (
          <section key={key}>
            <div
              className={cn(
                'mb-3 flex items-center gap-2 rounded-sm border px-4 py-2.5',
                config.headerClass
              )}
            >
              <h2 className={cn('type-heading-3 uppercase tracking-wide', config.labelClass)}>
                {config.label}
              </h2>
              <span className="type-caption text-text-tertiary">({tasks.length})</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <InboxTaskRow
                    key={task.taskId}
                    task={task}
                    compact={key === 'completed'}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface InboxBoardProps {
  groups: Record<InboxGroupKey, Task[]>;
}

export function InboxBoard({ groups }: InboxBoardProps) {
  const columns: InboxGroupKey[] = ['overdue', 'today', 'upcoming', 'completed'];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((key) => {
        const tasks = groups[key];
        const config = GROUP_CONFIG[key];

        return (
          <div
            key={key}
            className="flex min-h-[200px] flex-col rounded-md border border-border bg-surface-1/50"
          >
            <div className={cn('border-b border-border px-4 py-3', config.headerClass)}>
              <h2 className={cn('type-heading-3', config.labelClass)}>{config.label}</h2>
              <span className="type-caption text-text-tertiary">{tasks.length} tasks</span>
            </div>
            <div className="flex-1 space-y-2 p-3">
              {tasks.length === 0 ? (
                <p className="type-body-m py-6 text-center text-text-tertiary">Empty</p>
              ) : (
                tasks.map((task) => (
                  <InboxTaskRow key={task.taskId} task={task} compact />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
