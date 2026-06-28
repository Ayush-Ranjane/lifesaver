'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  footer: string;
  icon: LucideIcon;
  accent: 'cyan' | 'success' | 'indigo' | 'warning';
}

const ACCENT_ICON = {
  cyan: 'text-primary',
  success: 'text-accent-green',
  indigo: 'text-accent-purple',
  warning: 'text-accent-amber',
};

const ACCENT_VALUE = {
  cyan: 'text-text-primary',
  success: 'text-text-primary',
  indigo: 'text-text-primary',
  warning: 'text-text-primary',
};

const ACCENT_BG = {
  cyan: 'bg-primary/[0.08]',
  success: 'bg-accent-green/[0.08]',
  indigo: 'bg-accent-purple/[0.08]',
  warning: 'bg-accent-amber/[0.08]',
};

export function DashboardStatCard({ label, value, footer, icon: Icon, accent }: DashboardStatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110', ACCENT_BG[accent])}>
          <Icon className={cn('h-4 w-4', ACCENT_ICON[accent])} strokeWidth={1.75} />
        </div>
      </div>
      <p className={cn('text-[32px] font-bold tracking-tight leading-none', ACCENT_VALUE[accent])}>{value}</p>
      <p className="text-[13px] text-text-tertiary">{footer}</p>
    </div>
  );
}
