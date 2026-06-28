'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { AIPreferences, UserProfile, UserSettings } from '@/types';
import { toast } from 'sonner';

export function useUpdateUser() {
  const qc = useQueryClient();
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  return useMutation({
    mutationFn: (payload: {
      displayName?: string;
      settings?: Partial<UserSettings>;
      aiPreferences?: Partial<AIPreferences>;
    }) => {
      const { userProfile } = useAuthStore.getState();
      const body: Record<string, unknown> = {};
      if (payload.displayName !== undefined) body.displayName = payload.displayName;
      if (payload.settings) {
        body.settings = { ...userProfile?.settings, ...payload.settings };
      }
      if (payload.aiPreferences) {
        body.aiPreferences = { ...userProfile?.aiPreferences, ...payload.aiPreferences };
      }
      return apiFetch<UserProfile>('/api/user', { method: 'PATCH', body: JSON.stringify(body) });
    },
    onSuccess: (profile) => {
      setUserProfile(profile);
      qc.invalidateQueries({ queryKey: ['user'] });
      toast.success('Settings saved');
    },
    onError: (err: Error) => {
      toast.error('Failed to save settings', { description: err.message });
    },
  });
}
