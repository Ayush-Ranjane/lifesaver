'use client';

import { useState, use } from 'react';
import { usePodDetails, useSubmitPodGoal, useGeneratePodDigest } from '@/hooks/usePods';
import { useAuthStore } from '@/store/authStore';
import { Users, Target, ArrowLeft, Loader2, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PodDetailPage({ params }: { params: Promise<{ podId: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading } = usePodDetails(resolvedParams.podId);
  const { firebaseUser } = useAuthStore();
  const submitGoal = useSubmitPodGoal();
  const generateDigest = useGeneratePodDigest();

  const [myGoal, setMyGoal] = useState('');

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!data) return <div>Pod not found</div>;

  const { pod, members } = data;
  const myMemberDoc = members.find(m => m.userId === firebaseUser?.uid);

  const handleSubmitGoal = async () => {
    if (!myGoal.trim()) return;
    await submitGoal.mutateAsync({ podId: pod.id, goalTitle: myGoal });
    setMyGoal('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Link href="/pods" className="btn-ghost inline-flex text-sm mb-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Pods
      </Link>

      {/* Header */}
      <div className="glass rounded-3xl p-8 border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black">{pod.name}</h1>
            <span className="bg-secondary px-2.5 py-0.5 rounded-full text-xs font-medium border border-border">
              {members.length} Members
            </span>
          </div>
          {pod.description && <p className="text-muted-foreground">{pod.description}</p>}
          
          <div className="mt-6 flex items-center gap-3 bg-background/50 rounded-xl p-3 inline-flex border border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Invite Code:</span>
            <code className="bg-background px-2 py-1 rounded font-mono text-primary font-bold">{pod.inviteCode}</code>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content (2/3) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* My Goal Input */}
          <div className="glass rounded-2xl p-6 border-primary/20">
            <h2 className="font-semibold flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-primary" /> My Weekly Goal</h2>
            {myMemberDoc?.weeklyGoal ? (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="font-medium">{myMemberDoc.weeklyGoal}</p>
                {myMemberDoc.completedGoal ? (
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><Trophy className="w-4 h-4" /> Done</span>
                ) : (
                  <button onClick={() => setMyGoal(myMemberDoc.weeklyGoal!)} className="text-xs text-primary hover:underline">Edit</button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="I will ship..."
                  value={myGoal}
                  onChange={e => setMyGoal(e.target.value)}
                  className="input-base flex-1"
                />
                <button onClick={handleSubmitGoal} disabled={!myGoal.trim() || submitGoal.isPending} className="btn-primary">
                  {submitGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commit'}
                </button>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Pod Members</h2>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      User {member.userId.substring(0, 5)}
                      {member.userId === firebaseUser?.uid && <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">You</span>}
                    </p>
                    <p className={cn("text-xs mt-1", member.weeklyGoal ? "text-muted-foreground" : "text-amber-400/70 italic")}>
                      {member.weeklyGoal ? `🎯 ${member.weeklyGoal}` : "No goal set"}
                    </p>
                  </div>
                  {member.completedGoal && <Trophy className="w-5 h-5 text-emerald-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
            <h2 className="font-semibold flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-violet-400" /> AI Coach Digest</h2>
            
            {pod.latestDigest ? (
              <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">{pod.latestDigest}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">No digest generated yet for this week.</p>
            )}

            {myMemberDoc?.role === 'admin' && (
              <button
                onClick={() => generateDigest.mutate(pod.id)}
                disabled={generateDigest.isPending}
                className="btn-secondary w-full mt-4 text-xs"
              >
                {generateDigest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate New Digest'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
