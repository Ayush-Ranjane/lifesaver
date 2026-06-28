'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { ActiveTaskRow } from './ActiveTaskRow';
import type { Task } from '@/types';

interface ActiveTasksWidgetProps {
  tasks: Task[];
}

export function ActiveTasksWidget({ tasks }: ActiveTasksWidgetProps) {
  const { openModal } = useUIStore();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-text-primary">Active Tasks</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {tasks.length}
          </span>
        </div>
        <Link
          href="/inbox"
          className="flex items-center gap-1 text-[13px] text-text-tertiary transition-colors hover:text-primary"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] font-medium text-text-primary">All caught up!</p>
            <p className="mt-1 text-[13px] text-text-secondary">No active tasks right now.</p>
            <button
              onClick={() => openModal('task-create')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add a task
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <ActiveTaskRow key={task.taskId} task={task} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

interface AIInsightCardProps {
  narrative?: string;
  recommendation?: string;
  loading?: boolean;
}

export function AIInsightCard({ narrative, recommendation, loading }: AIInsightCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-purple/[0.08]">
          <Sparkles className="h-4 w-4 text-accent-purple" />
        </div>
        <h3 className="text-[14px] font-semibold text-text-primary">AI Insight</h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-[80%] rounded" />
        </div>
      ) : (
        <>
          <p className="text-[14px] leading-relaxed text-text-secondary">
            {narrative ?? 'Complete a few tasks this week to unlock personalized AI insights.'}
          </p>
          {recommendation && (
            <p className="mt-3 text-[13px] font-medium text-primary">{recommendation}</p>
          )}
        </>
      )}
    </div>
  );
}
