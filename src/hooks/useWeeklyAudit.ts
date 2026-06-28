'use client';
// ─── Weekly Life Audit Hooks ───────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { toast } from 'sonner';
import { getISOWeek, getYear } from 'date-fns';

export function getWeekId(): string {
  const now = new Date();
  return `${getYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
}

export interface WeeklyAuditReport {
  weekId: string;
  weekScore: number;
  headline: string;
  wins: [string, string, string];
  patterns: [string, string];
  avoidances: string[];
  nextWeekGoals: [string, string, string];
  closingNote: string;
  generatedAt: string;
}

export function useLatestAudit() {
  return useQuery<WeeklyAuditReport | null>({
    queryKey: ['weeklyAudit', 'latest'],
    queryFn: () => apiFetch<WeeklyAuditReport | null>('/api/ai/weekly-audit'),
    staleTime: 60_000 * 60, // 1 hour
  });
}

export function useGenerateAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<WeeklyAuditReport>('/api/ai/weekly-audit', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weeklyAudit'] });
      toast.success('Your weekly audit is ready!', { description: 'Reflecting on your week...' });
    },
    onError: (err: Error) => {
      toast.error('Failed to generate audit', { description: err.message });
    },
  });
}
