'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Flame, CheckCircle2, Circle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, cn } from '@/lib/utils';
import type { Habit } from '@/types';
import { toast } from 'sonner';

export function HabitSnapshotWidget() {
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => apiFetch<Habit[]>('/api/habits'),
    staleTime: 60_000,
  });

  const checkin = useMutation({
    mutationFn: (habitId: string) =>
      apiFetch(`/api/habits/${habitId}/checkin`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit checked in!');
    },
  });

  const snapshot = habits.slice(0, 4);

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent-amber" />
          <h3 className="text-[14px] font-semibold text-text-primary">Habits</h3>
        </div>
        <Link href="/habits" className="text-[13px] text-text-tertiary hover:text-primary transition-colors">
          View all
        </Link>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <>
            <div className="skeleton h-12 rounded-md" />
            <div className="skeleton h-12 rounded-md" />
          </>
        ) : snapshot.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-text-tertiary">
            No habits yet.{' '}
            <Link href="/habits" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          snapshot.map((habit) => {
            const doneToday = habit.entries.some((e) => e.date === today);
            return (
              <div
                key={habit.habitId}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <button
                  type="button"
                  onClick={() => !doneToday && checkin.mutate(habit.habitId)}
                  disabled={doneToday || checkin.isPending}
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors',
                    doneToday
                      ? 'bg-accent-green/10 text-accent-green'
                      : 'bg-muted text-text-tertiary hover:bg-primary/10 hover:text-primary'
                  )}
                  aria-label={`Check in ${habit.name}`}
                >
                  {doneToday ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-text-primary">{habit.name}</p>
                  <p className="text-[12px] text-text-tertiary">
                    {habit.currentStreak} day streak
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {habit.entries.slice(-7).map((e) => (
                    <div
                      key={e.entryId}
                      className={cn(
                        'h-2 w-2 rounded-full',
                        e.date === today || habit.entries.some((x) => x.date === e.date)
                          ? 'bg-primary/60'
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
