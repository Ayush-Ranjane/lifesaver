'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { TaskStatus, TaskPriority, TaskCategory, TaskEffort } from '@/types';

export interface InboxFilters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  categories: TaskCategory[];
  efforts: TaskEffort[];
}

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
  statuses: [],
  priorities: [],
  categories: [],
  efforts: [],
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: TaskPriority[] = ['critical', 'high', 'medium', 'low'];
const CATEGORY_OPTIONS: TaskCategory[] = [
  'work',
  'personal',
  'study',
  'finance',
  'health',
  'errands',
  'other',
];
const EFFORT_OPTIONS: { value: TaskEffort; label: string }[] = [
  { value: 'quick', label: 'Quick (<15m)' },
  { value: 'short', label: 'Short (<1h)' },
  { value: 'deep', label: 'Deep (>1h)' },
];

interface InboxFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: InboxFilters;
  onChange: (filters: InboxFilters) => void;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="type-caption mb-3 text-text-tertiary">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function InboxFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
}: InboxFilterDrawerProps) {
  const set = <K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-surface-2 shadow-elevation-3"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="type-heading-2 text-text-primary">Filters</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <FilterSection title="Status">
                {STATUS_OPTIONS.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    label={opt.label}
                    checked={filters.statuses.includes(opt.value)}
                    onCheckedChange={() =>
                      set('statuses', toggle(filters.statuses, opt.value))
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Priority">
                {PRIORITY_OPTIONS.map((p) => (
                  <Checkbox
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    checked={filters.priorities.includes(p)}
                    onCheckedChange={() =>
                      set('priorities', toggle(filters.priorities, p))
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Category">
                {CATEGORY_OPTIONS.map((c) => (
                  <Checkbox
                    key={c}
                    label={c.charAt(0).toUpperCase() + c.slice(1)}
                    checked={filters.categories.includes(c)}
                    onCheckedChange={() =>
                      set('categories', toggle(filters.categories, c))
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Effort">
                {EFFORT_OPTIONS.map((e) => (
                  <Checkbox
                    key={e.value}
                    label={e.label}
                    checked={filters.efforts.includes(e.value)}
                    onCheckedChange={() =>
                      set('efforts', toggle(filters.efforts, e.value))
                    }
                  />
                ))}
              </FilterSection>
            </div>

            <div className="flex gap-3 border-t border-border px-6 py-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => onChange(DEFAULT_INBOX_FILTERS)}
              >
                Clear all
              </Button>
              <Button variant="primary" className="flex-1" onClick={onClose}>
                Apply
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function hasActiveFilters(filters: InboxFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.categories.length > 0 ||
    filters.efforts.length > 0
  );
}
