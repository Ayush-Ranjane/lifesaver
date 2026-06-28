'use client';

import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  Plus,
  Mail,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type InboxView = 'list' | 'board';
export type InboxSort = 'deadline' | 'priority' | 'created';

interface InboxToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  view: InboxView;
  onViewChange: (v: InboxView) => void;
  sort: InboxSort;
  onSortChange: (v: InboxSort) => void;
  onOpenFilters: () => void;
  filterActive: boolean;
  onNewTask: () => void;
  onGmailScan: () => void;
  scanningGmail: boolean;
}

const SORT_OPTIONS: { value: InboxSort; label: string }[] = [
  { value: 'deadline', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created' },
];

export function InboxToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  onOpenFilters,
  filterActive,
  onNewTask,
  onGmailScan,
  scanningGmail,
}: InboxToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-canvas/90 px-4 py-4 backdrop-blur-glass sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks…"
            leftIcon={<Search className="h-[18px] w-[18px]" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterActive ? 'outline' : 'secondary'}
            size="sm"
            onClick={onOpenFilters}
            className={cn(filterActive && 'border-cyan/30 text-cyan')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSortOpen((o) => !o)}
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full z-40 mt-2 min-w-[160px] rounded-sm border border-border bg-surface-2 py-1 shadow-elevation-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'flex w-full px-4 py-2 text-left text-body-m transition-colors hover:bg-surface-3',
                        sort === opt.value ? 'text-cyan' : 'text-text-secondary'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex rounded-sm border border-border bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-micro transition-colors',
                view === 'list' ? 'bg-surface-3 text-cyan' : 'text-text-tertiary hover:text-text-primary'
              )}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('board')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-micro transition-colors',
                view === 'board' ? 'bg-surface-3 text-cyan' : 'text-text-tertiary hover:text-text-primary'
              )}
              aria-label="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={onGmailScan} disabled={scanningGmail}>
            {scanningGmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Gmail</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onNewTask}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
    </div>
  );
}
