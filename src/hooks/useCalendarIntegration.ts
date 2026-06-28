import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { toast } from 'sonner';

export function useBlockCalendar() {
  return useMutation({
    mutationFn: (data: { taskId: string; title: string; start: string; end: string }) =>
      apiFetch<{ eventId: string }>('/api/calendar/block', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Time blocked on Google Calendar');
    },
    onError: (err: Error) => {
      toast.error('Failed to block calendar', { description: err.message });
    }
  });
}

export function useCalendarBusyBlocks() {
  return useQuery({
    queryKey: ['calendar', 'busyBlocks'],
    queryFn: async () => {
      const data = await apiFetch<{ busyBlocks: { id: string; title: string; start: string; end: string }[] }>('/api/calendar/sync');
      return data.busyBlocks;
    },
    // Don't auto-fetch unless the user navigates to the schedule picker
    enabled: false,
  });
}
