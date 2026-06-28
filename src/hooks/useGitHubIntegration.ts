import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { create } from 'zustand';

export interface GitHubIssue {
  id: string;
  title: string;
  repo: string;
  url: string;
  number: number;
}

export function useGitHubSync() {
  return useQuery({
    queryKey: ['github', 'sync'],
    queryFn: async () => {
      const data = await apiFetch<{ issues: GitHubIssue[] }>('/api/github/sync', { method: 'POST' });
      return data.issues;
    },
    enabled: false,
  });
}

interface GitHubImportState {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

export const useGitHubImportStore = create<GitHubImportState>((set) => ({
  isOpen: false,
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
}));
