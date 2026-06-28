'use client';

import { useState } from 'react';
import { useMyPods, useCreatePod, useJoinPod } from '@/hooks/usePods';
import { Users, Plus, Hash, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PodsIndexPage() {
  const { data: pods, isLoading } = useMyPods();
  const createPod = useCreatePod();
  const joinPod = useJoinPod();

  const [inviteCode, setInviteCode] = useState('');
  const [newPodName, setNewPodName] = useState('');

  const handleCreate = async () => {
    if (!newPodName.trim()) return;
    await createPod.mutateAsync({ name: newPodName });
    setNewPodName('');
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    await joinPod.mutateAsync(inviteCode);
    setInviteCode('');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Accountability Pods</h1>
          <p className="text-sm text-muted-foreground">Small groups, high accountability. Never ship alone.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Pod */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Create a Pod</h2>
          <p className="text-sm text-muted-foreground">Start a private group for your friends or team.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pod Name (e.g. Weekend Hackers)"
              value={newPodName}
              onChange={e => setNewPodName(e.target.value)}
              className="input-base flex-1"
            />
            <button
              onClick={handleCreate}
              disabled={createPod.isPending || !newPodName.trim()}
              className="btn-primary"
            >
              {createPod.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </div>

        {/* Join Pod */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Hash className="w-4 h-4" /> Join a Pod</h2>
          <p className="text-sm text-muted-foreground">Enter an invite code to join an existing pod.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Invite Code (e.g. A1B2C3)"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              className="input-base flex-1 uppercase"
            />
            <button
              onClick={handleJoin}
              disabled={joinPod.isPending || !inviteCode.trim()}
              className="btn-secondary"
            >
              {joinPod.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
            </button>
          </div>
        </div>
      </div>

      {/* My Pods */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">My Pods</h2>
        {isLoading ? (
          <div className="glass-card p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-text-tertiary" /></div>
        ) : pods?.length === 0 ? (
          <div className="glass-card border-dashed p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">You are not in any pods yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pods?.map((pod) => (
              <Link key={pod.id} href={`/pods/${pod.id}`}>
                <motion.div whileHover={{ y: -4, scale: 1.01 }} className="glass-card p-5 transition-all duration-300 group hover:border-[var(--glass-border-active)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{pod.name}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">{pod.members.length} members</p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
