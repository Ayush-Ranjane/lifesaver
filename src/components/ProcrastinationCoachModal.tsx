'use client';
/* eslint-disable react/no-unescaped-entities */
// ─── Procrastination Coach Modal ───────────────────────────────────────────────
// Triggered when a task is rescheduled 3+ times.
// 5 animated steps: intro → Q1 → Q2 → Q3 → AI action plan

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProcrastinationStore } from '@/store/procrastinationStore';
import { useUIStore } from '@/store/uiStore';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { apiFetch } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Brain, X, ChevronRight, Sparkles, CheckCircle2, Loader2, Trash2, AlarmClock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function ProcrastinationCoachModal() {
  const {
    coachingTaskId, coachingTaskTitle, rescheduleCount,
    step, answers, aiActionPlan, isLoading,
    nextStep, setActionPlan, setLoading, reset,
  } = useProcrastinationStore();
  const { closeModal } = useUIStore();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { firebaseUser } = useAuthStore();

  const [q1Answer, setQ1Answer] = useState('');
  const [q3Answer, setQ3Answer] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const close = () => {
    reset();
    closeModal();
  };

  const handleGetPlan = async () => {
    if (!coachingTaskId || !firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const plan = await apiFetch('/api/ai/procrastination-coach', {
        method: 'POST',
        body: JSON.stringify({
          taskTitle: coachingTaskTitle,
          taskTags: [],
          rescheduleCount,
          answers: [...answers, q3Answer],
        }),
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionPlan(plan as { validation: string; steps: [string, string, string]; closing: string });
    } catch {
      setLoading(false);
    }
  };

  const handleStartNow = () => {
    if (coachingTaskId) {
      updateTask.mutate({ taskId: coachingTaskId, updates: { status: 'in_progress' } });
    }
    close();
  };

  const handleRemindTomorrow = () => {
    if (!coachingTaskId) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    // Pass a flag to NOT increment rescheduleCount
    updateTask.mutate({ taskId: coachingTaskId, updates: { deadline: tomorrow, snoozedUntil: tomorrow } });
    close();
  };

  const handleDelete = () => {
    if (coachingTaskId) {
      deleteTask.mutate(coachingTaskId);
    }
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={close}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg mx-4 glass border border-border rounded-3xl p-8 shadow-2xl"
      >
        {/* Close button */}
        <button onClick={close} className="absolute top-5 right-5 btn-ghost p-2 rounded-xl">
          <X className="w-4 h-4" />
        </button>

        {/* Icon header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI Focus Coach</p>
            <h2 className="font-bold text-lg leading-tight">Let&apos;s work through this</h2>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 0: Intro */}
          {step === 0 && (
            <motion.div key="step-0" {...STEP_VARIANTS} className="space-y-4">
              <div className="glass bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-sm font-medium text-amber-300 mb-1">Task Rescheduled {rescheduleCount} Times</p>
                <p className="text-base font-semibold leading-snug">{coachingTaskTitle}</p>
              </div>
              <p className="text-sm text-text-secondary">
                You've rescheduled this task {rescheduleCount} times. That's okay — let's figure out what's really going on and make a plan you can actually follow through on.
              </p>
              <p className="text-xs text-text-secondary italic">3 quick questions. Takes 2 minutes.</p>
              <button onClick={() => nextStep()} className="btn-primary w-full">
                Start Coaching <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coaching-disable"
                  className="rounded"
                  onChange={(e) => {
                    if (e.target.checked && coachingTaskId) {
                      updateTask.mutate({ taskId: coachingTaskId, updates: { isArchived: false } }); // mark coachingDisabled
                    }
                  }}
                />
                <label htmlFor="coaching-disable" className="text-xs text-muted-foreground cursor-pointer">
                  Don&apos;t show coaching for this task again
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 1: Q1 */}
          {step === 1 && (
            <motion.div key="step-1" {...STEP_VARIANTS} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">1 / 3</span>
              </div>
              <p className="font-semibold text-base text-white">What&apos;s making this task hard to start?</p>
              <p className="text-xs text-text-secondary">Be honest — no judgment here. Too vague? Scary? Boring? Not sure how to begin?</p>
              <textarea
                value={q1Answer}
                onChange={e => setQ1Answer(e.target.value)}
                rows={3}
                placeholder="It feels overwhelming because..."
                className="input-base resize-none w-full"
              />
              <button
                disabled={q1Answer.trim().length < 5}
                onClick={() => nextStep(q1Answer)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Q2 */}
          {step === 2 && (
            <motion.div key="step-2" {...STEP_VARIANTS} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">2 / 3</span>
              </div>
              <p className="font-semibold text-base text-white">Is this task truly important to you right now?</p>
              <p className="text-xs text-text-secondary">There&apos;s no wrong answer. Sometimes the best choice is to let go.</p>
              <div className="grid gap-2">
                {[
                  { label: 'Yes, it\'s critical', value: 'Yes, critical', color: 'border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300' },
                  { label: 'Somewhat, but I\'m avoiding it', value: 'Somewhat', color: 'border-amber-500/40 hover:bg-amber-500/10 text-amber-300' },
                  { label: 'Honestly, not really', value: 'Honestly, no', color: 'border-red-500/40 hover:bg-red-500/10 text-red-300' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => nextStep(opt.value)}
                    className={cn('w-full text-left p-3.5 rounded-xl border glass transition-all text-sm font-medium', opt.color)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Q3 */}
          {step === 3 && (
            <motion.div key="step-3" {...STEP_VARIANTS} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">3 / 3</span>
              </div>
              <p className="font-semibold text-base text-white">What&apos;s the smallest action you could take in the next 10 minutes?</p>
              <p className="text-xs text-text-secondary">Make it ridiculously small. Open the doc. Write one sentence. Send one email.</p>
              <textarea
                value={q3Answer}
                onChange={e => setQ3Answer(e.target.value)}
                rows={3}
                placeholder="I could start by..."
                className="input-base resize-none w-full"
              />
              <button
                disabled={q3Answer.trim().length < 5 || isLoading}
                onClick={handleGetPlan}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Get My Action Plan</>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 4: AI Action Plan */}
          {step === 4 && aiActionPlan && (
            <motion.div key="step-4" {...STEP_VARIANTS} className="space-y-5">
              {/* Validation */}
              <p className="text-sm text-text-secondary leading-relaxed">{aiActionPlan.validation}</p>

              {/* Steps */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Your 3-Step Plan</p>
                {aiActionPlan.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-start gap-3 glass rounded-xl p-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-white">{step}</p>
                  </motion.div>
                ))}
              </div>

              {/* Closing */}
              <p className="text-xs text-muted-foreground italic text-center">{aiActionPlan.closing}</p>

              {/* Actions */}
              <div className="grid gap-2">
                <button onClick={handleStartNow} className="btn-primary w-full">
                  <CheckCircle2 className="w-4 h-4" /> Start with Step 1 Now
                </button>
                <button onClick={handleRemindTomorrow} className="btn-secondary w-full">
                  <AlarmClock className="w-4 h-4" /> Remind Me Tomorrow
                </button>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost w-full text-destructive hover:text-destructive text-sm">
                    <Trash2 className="w-4 h-4" /> Delete this task
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleDelete} className="btn-ghost flex-1 text-destructive text-sm border border-destructive/30">
                      Confirm Delete
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 text-sm">
                      Keep It
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
