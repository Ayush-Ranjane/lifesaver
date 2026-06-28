'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, cn } from '@/lib/utils';
import type { Habit, CreateHabitInput } from '@/types';
import { Flame, Plus, X, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── GitHub-style heatmap (90 days) ──────────────────────────────────────────
function HabitHeatmap({ entries }: { entries: Habit['entries'] }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 89), end: new Date() });
  const entrySet = new Set(entries.map(e => e.date));

  return (
    <div className="flex gap-0.5 flex-wrap">
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const done = entrySet.has(dateStr);
        return (
          <div
            key={dateStr}
            title={`${format(day, 'MMM d')}: ${done ? 'Done' : 'Missed'}`}
            className={cn(
              'w-3 h-3 rounded-sm transition-colors',
              done ? 'bg-violet-500' : 'bg-secondary'
            )}
          />
        );
      })}
    </div>
  );
}

function HabitCard({ habit, onCheckin }: { habit: Habit; onCheckin: (id: string) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const doneToday = habit.entries.some(e => e.date === today);

  return (
    <div className={cn('task-card p-5 space-y-4', doneToday && 'border-emerald-500/30 bg-emerald-500/5')}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{habit.name}</h3>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{habit.frequency} · {habit.category}</p>
        </div>
        <button
          onClick={() => !doneToday && onCheckin(habit.habitId)}
          disabled={doneToday}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all',
            doneToday
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-secondary hover:bg-primary/20 hover:text-primary hover:scale-110'
          )}
        >
          {doneToday ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
          <Flame className="w-4 h-4" /> {habit.currentStreak} day streak
        </span>
        {habit.longestStreak > 0 && (
          <span className="text-muted-foreground text-xs">Best: {habit.longestStreak}</span>
        )}
      </div>

      {/* Heatmap */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Last 90 days</p>
        <HabitHeatmap entries={habit.entries} />
      </div>
    </div>
  );
}

export function HabitsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateHabitInput>({ name: '', frequency: 'daily', category: 'personal' });

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => apiFetch<Habit[]>('/api/habits'),
  });

  const checkin = useMutation({
    mutationFn: (habitId: string) => apiFetch(`/api/habits/${habitId}/checkin`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Habit checked in! 🎉");
    },
  });

  const create = useMutation({
    mutationFn: (data: CreateHabitInput) => apiFetch<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created!');
      setShowCreate(false);
      setForm({ name: '', frequency: 'daily', category: 'personal' });
    },
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-lg" />)}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" /> Habits
        </h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Flame className="w-16 h-16 text-orange-400/30 mx-auto mb-4" />
          <h2 className="font-semibold text-xl mb-2">Build better habits</h2>
          <p className="text-muted-foreground text-sm mb-6">Track daily and weekly habits. Watch your streaks grow.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add First Habit
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <HabitCard key={habit.habitId} habit={habit} onCheckin={(id) => checkin.mutate(id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md glass-card overflow-hidden shadow-apple-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold">New Habit</h2>
                <button onClick={() => setShowCreate(false)} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <input autoFocus className="input-base" placeholder="Habit name (e.g. Read 20 pages)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <div className="flex gap-2">
                  {(['daily', 'weekly'] as const).map(f => (
                    <button type="button" key={f} onClick={() => setForm(prev => ({ ...prev, frequency: f }))} className={cn('flex-1 py-2 rounded-md border text-sm transition-all capitalize', form.frequency === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                      {f}
                    </button>
                  ))}
                </div>
                <input className="input-base" type="time" placeholder="Reminder time (optional)" onChange={e => setForm(f => ({ ...f, reminderTime: e.target.value }))} />
              </div>
              <div className="flex gap-2 px-5 py-4 border-t border-border">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="button" className="btn-primary flex-1" disabled={!form.name || create.isPending} onClick={() => create.mutate(form)}>
                  {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Habit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
