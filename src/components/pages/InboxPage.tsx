'use client';

import { useMemo, useState } from 'react';
import { isPast, isToday } from 'date-fns';
import { CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTaskList } from '@/hooks/useTasks';
import { useUIStore } from '@/store/uiStore';
import { useGmailScan } from '@/hooks/useGmailIntegration';
import { useInboxReviewStore } from '@/store/inboxReviewStore';
import { Button } from '@/components/ui/button';
import {
  InboxToolbar,
  type InboxView,
  type InboxSort,
} from '@/components/inbox/InboxToolbar';
import {
  InboxFilterDrawer,
  DEFAULT_INBOX_FILTERS,
  hasActiveFilters,
  type InboxFilters,
} from '@/components/inbox/InboxFilterDrawer';
import {
  InboxTaskList,
  InboxBoard,
  type InboxGroupKey,
} from '@/components/inbox/InboxTaskList';
import type { Task, TaskPriority } from '@/types';

const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function classifyTask(task: Task): InboxGroupKey {
  if (task.status === 'completed') return 'completed';
  if (isPast(task.deadline)) return 'overdue';
  if (isToday(task.deadline)) return 'today';
  return 'upcoming';
}

function sortTasks(tasks: Task[], sort: InboxSort): Task[] {
  return [...tasks].sort((a, b) => {
    if (sort === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (sort === 'priority')
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function applyFilters(tasks: Task[], search: string, filters: InboxFilters): Task[] {
  return tasks.filter((t) => {
    if (t.isArchived) return false;

    if (filters.statuses.length && !filters.statuses.includes(t.status)) return false;
    if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false;
    if (filters.categories.length && !filters.categories.includes(t.category)) return false;
    if (filters.efforts.length && !filters.efforts.includes(t.effort)) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });
}

export function InboxPage() {
  const { data: tasks = [], isLoading } = useTaskList();
  const { openModal } = useUIStore();
  const { refetch: scanGmail, isFetching: scanningGmail } = useGmailScan();
  const openReview = useInboxReviewStore((s) => s.openReview);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<InboxView>('list');
  const [sort, setSort] = useState<InboxSort>('deadline');
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_INBOX_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleGmailScan = async () => {
    const result = await scanGmail();
    const extracted = result.data ?? [];
    if (extracted.length === 0) {
      toast.info('No tasks found in recent emails');
      return;
    }
    openReview(extracted);
  };

  const groups = useMemo(() => {
    const filtered = sortTasks(applyFilters(tasks, search, filters), sort);
    const result: Record<InboxGroupKey, Task[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: [],
    };
    for (const task of filtered) {
      result[classifyTask(task)].push(task);
    }
    return result;
  }, [tasks, search, filters, sort]);

  const totalVisible =
    groups.overdue.length +
    groups.today.length +
    groups.upcoming.length +
    groups.completed.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-14 rounded-sm" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InboxToolbar
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
        sort={sort}
        onSortChange={setSort}
        onOpenFilters={() => setDrawerOpen(true)}
        filterActive={hasActiveFilters(filters)}
        onNewTask={() => openModal('task-create')}
        onGmailScan={handleGmailScan}
        scanningGmail={scanningGmail}
      />

      <InboxFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
      />

      {totalVisible === 0 ? (
        <div className="rounded-md border border-border bg-surface-1 py-16 text-center shadow-elevation-1">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success/40" />
          <p className="type-heading-2 text-text-primary">Nothing here</p>
          <p className="type-body-m mt-1 text-text-secondary">
            {search || hasActiveFilters(filters)
              ? 'No tasks match your filters'
              : 'Add your first task to get started'}
          </p>
          <Button variant="primary" className="mt-6" onClick={() => openModal('task-create')}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      ) : view === 'list' ? (
        <InboxTaskList groups={groups} />
      ) : (
        <InboxBoard groups={groups} />
      )}
    </div>
  );
}
