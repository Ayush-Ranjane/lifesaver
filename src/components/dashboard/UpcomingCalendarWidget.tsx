'use client';

import Link from 'next/link';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn, PRIORITY_DOT_COLORS } from '@/lib/utils';
import type { Task } from '@/types';

function formatEventTime(date: Date) {
  if (isToday(date)) return `Today · ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, 'h:mm a')}`;
  return format(date, 'EEE · h:mm a');
}

interface UpcomingCalendarWidgetProps {
  tasks: Task[];
}

export function UpcomingCalendarWidget({ tasks }: UpcomingCalendarWidgetProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-text-tertiary" />
          <h3 className="text-[14px] font-semibold text-text-primary">Upcoming</h3>
        </div>
        <Link href="/calendar" className="text-[13px] text-text-tertiary hover:text-primary transition-colors">
          Calendar
        </Link>
      </div>

      <div className="space-y-1">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-text-tertiary">Nothing scheduled ahead.</p>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.taskId}
              href={`/tasks/${task.taskId}`}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted"
            >
              <span className={cn('priority-dot', PRIORITY_DOT_COLORS[task.priority])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-text-primary">{task.title}</p>
                <p className="text-[12px] text-text-tertiary">
                  {formatEventTime(task.scheduledStart ?? task.deadline)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
