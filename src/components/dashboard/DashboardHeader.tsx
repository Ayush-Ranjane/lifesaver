'use client';

import { format } from 'date-fns';

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface DashboardHeaderProps {
  name?: string;
  pendingCount: number;
  completedTodayCount: number;
}

export function DashboardHeader({ name, pendingCount, completedTodayCount }: DashboardHeaderProps) {
  const now = new Date();
  const firstName = name?.split(' ')[0] ?? 'there';

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-vibrant pb-1">
          {getGreeting(now.getHours())}, {firstName}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {pendingCount} task{pendingCount !== 1 ? 's' : ''} remaining &middot; {completedTodayCount} completed today
        </p>
      </div>
      <span className="inline-flex items-center rounded-md bg-muted border border-border px-3 py-1.5 text-[13px] font-medium text-text-secondary w-fit">
        {format(now, 'EEEE, MMM d')}
      </span>
    </header>
  );
}
