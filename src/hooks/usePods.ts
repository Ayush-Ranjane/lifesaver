import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { db } from '@/lib/firebase/client';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';

export interface Pod {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  inviteCode: string;
  creatorId: string;
  members: string[];
  createdAt: unknown;
  latestDigest?: string;
}

export interface PodMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: unknown;
  weeklyGoal: string | null;
  completedGoal: boolean;
}

export function useMyPods() {
  const { userProfile } = useAuthStore();
  const podIds = userProfile?.podIds || [];

  return useQuery({
    queryKey: ['pods', 'my'],
    queryFn: async () => {
      if (podIds.length === 0) return [];
      const pods: Pod[] = [];
      for (const id of podIds) {
        const snap = await getDoc(doc(db, 'pods', id));
        if (snap.exists()) {
          pods.push(snap.data() as Pod);
        }
      }
      return pods;
    },
    enabled: !!userProfile,
  });
}

export function usePodDetails(podId: string) {
  return useQuery({
    queryKey: ['pods', podId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'pods', podId));
      if (!snap.exists()) throw new Error('Pod not found');
      
      const membersSnap = await getDocs(collection(db, `pods/${podId}/members`));
      const members = membersSnap.docs.map(d => d.data() as PodMember);
      
      return { pod: snap.data() as Pod, members };
    },
    enabled: !!podId,
  });
}

export function useCreatePod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic?: boolean }) =>
      apiFetch<Pod>('/api/pods/create', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pods', 'my'] });
    },
  });
}

export function useJoinPod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) =>
      apiFetch<{ id: string; name: string }>('/api/pods/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pods', 'my'] });
    },
  });
}

export function useSubmitPodGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { podId: string; goalTitle: string }) =>
      apiFetch('/api/pods/goals/submit', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['pods', variables.podId] });
    },
  });
}

export function useGeneratePodDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (podId: string) =>
      apiFetch<{ digest: string }>('/api/pods/digest', { method: 'POST', body: JSON.stringify({ podId }) }),
    onSuccess: (_, podId) => {
      qc.invalidateQueries({ queryKey: ['pods', podId] });
    },
  });
}
