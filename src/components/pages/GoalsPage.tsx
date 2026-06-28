'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import type { Goal, CreateGoalInput, GoalType, GoalDuration } from '@/types';
import { Target, Plus, X, Loader2, Calendar, CheckCircle2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useFutureLetterStore } from '@/store/futureLetterStore';

const GOAL_TYPE_OPTIONS: { label: string; value: GoalType; icon: string }[] = [
  { label: 'Career', value: 'career', icon: '💼' },
  { label: 'Health', value: 'health', icon: '❤️' },
  { label: 'Learning', value: 'learning', icon: '📚' },
  { label: 'Finance', value: 'finance', icon: '💰' },
  { label: 'Personal', value: 'personal', icon: '🌟' },
  { label: 'Other', value: 'other', icon: '🎯' },
];

function ProgressRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(217 33% 20%)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke="hsl(252 87% 67%)" strokeWidth={6}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        className="rotate-90" style={{ fontSize: 14, fontWeight: 700, fill: 'hsl(210 40% 96%)', transform: `rotate(90deg) translate(0, ${-size}px)` }}
      />
    </svg>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
  return (
    <div className="task-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-muted-foreground capitalize">{goal.type}</span>
          <h3 className="font-semibold mt-0.5 line-clamp-2">{goal.title}</h3>
        </div>
        <div className="flex-shrink-0 relative">
          <ProgressRing percent={goal.progressPercent} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{goal.progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
        </span>
        <span>{goal.linkedTaskIds.length} tasks</span>
      </div>

      {/* Milestones preview */}
      <div className="space-y-1">
        {goal.milestones.slice(0, 3).map(m => (
          <div key={m.milestoneId} className="flex items-center gap-2 text-xs">
            {m.isCompleted
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              : <div className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
            }
            <span className={cn('truncate', m.isCompleted && 'line-through text-muted-foreground')}>
              Week {m.weekNumber}: {m.title}
            </span>
          </div>
        ))}
        {goal.milestones.length > 3 && (
          <p className="text-xs text-muted-foreground pl-5">+{goal.milestones.length - 3} more milestones</p>
        )}
      </div>
    </div>
  );
}

function CreateGoalModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateGoalInput>({ title: '', type: 'career', durationDays: 30 });
  const create = useMutation({
    mutationFn: (data: CreateGoalInput) => apiFetch<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created!', { description: 'AI is generating your roadmap...' });
      onClose();
    },
    onError: () => toast.error('Failed to create goal'),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg glass rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> New Goal</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Goal Title</label>
            <input
              autoFocus
              className="input-base"
              placeholder="e.g. Get AWS certification in 60 days"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                  className={cn(
                    'p-3 rounded-xl border text-sm font-medium transition-all',
                    form.type === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Duration</label>
            <div className="flex gap-2">
              {([30, 60, 90] as GoalDuration[]).map(d => (
                <button
                  key={d}
                  onClick={() => setForm(f => ({ ...f, durationDays: d }))}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    form.durationDays === d
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="input-base resize-none"
            placeholder="Description (optional)"
            rows={2}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            className="btn-primary flex-1"
            disabled={!form.title || create.isPending}
            onClick={() => create.mutate(form)}
          >
            {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating roadmap...</> : '🚀 Create Goal'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GoalsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const openFutureLetter = useFutureLetterStore((s) => s.open);
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => apiFetch<Goal[]>('/api/goals'),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-32" />
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" /> Goals
        </h1>
        <div className="flex gap-2">
          <button onClick={openFutureLetter} className="btn-secondary">
            <Mail className="w-4 h-4" /> Future Letter
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Target className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h2 className="font-semibold text-xl mb-2">Set your first goal</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Tell the AI your goal and it will generate a week-by-week roadmap with tasks to keep you on track.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map(goal => <GoalCard key={goal.goalId} goal={goal} />)}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateGoalModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
