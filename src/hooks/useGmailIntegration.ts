import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';

export interface ExtractedTask {
  title: string;
  sourceEmailId: string;
  confidence: number;
  suggestedPriority: 'high' | 'medium' | 'low';
}

export function useGmailScan() {
  return useQuery({
    queryKey: ['gmail', 'scan'],
    queryFn: async () => {
      const data = await apiFetch<{ extractedTasks: ExtractedTask[] }>('/api/gmail/scan', { method: 'POST' });
      return data.extractedTasks;
    },
    // Only enabled if we explicitly call refetch()
    enabled: false,
  });
}
