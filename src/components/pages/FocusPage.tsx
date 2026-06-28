'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTask, useCompleteTask } from '@/hooks/useTasks';
import { motion, AnimatePresence } from 'framer-motion';

import { FocusTaskSelector, useFocusTaskId } from '@/components/focus/FocusTaskSelector';
import { FocusTimer, type Phase } from '@/components/focus/FocusTimer';
import { FocusLofiPlayer } from '@/components/focus/FocusLofiPlayer';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;
const LONG_BREAK_SECS = 15 * 60;

function phaseTotal(phase: Phase) {
  if (phase === 'work') return WORK_SECS;
  if (phase === 'break') return BREAK_SECS;
  return LONG_BREAK_SECS;
}

export function FocusPage() {
  const { taskId, setTaskId } = useFocusTaskId();
  const { data: task } = useTask(taskId);
  const completeTask = useCompleteTask();

  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showSummary, setShowSummary] = useState(false);



  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setSecondsLeft((s) => {
      if (s <= 1) {
        if (phase === 'work') {
          const newCount = pomodorosCompleted + 1;
          setPomodorosCompleted(newCount);
          const nextPhase = newCount % 4 === 0 ? 'long_break' : 'break';
          setPhase(nextPhase);
          return nextPhase === 'long_break' ? LONG_BREAK_SECS : BREAK_SECS;
        }
        setPhase('work');
        return WORK_SECS;
      }
      return s - 1;
    });
    setSessionSeconds((s) => s + 1);
  }, [phase, pomodorosCompleted]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(WORK_SECS);
    setPhase('work');
  };

  const totalMinutes = Math.round(sessionSeconds / 60);
  const uiDimmed = running;

  return (
    <div className="relative -mx-4 -mb-4 flex min-h-[calc(100vh-var(--topbar-height)-2rem)] flex-col overflow-hidden sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8">
      {/* Ambient background removed for minimalist design */}

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-28">
          <div className="mb-10 w-full max-w-md">
            <FocusTaskSelector
              taskId={taskId}
              onSelect={setTaskId}
              dimmed={uiDimmed}
            />
          </div>

          <FocusTimer
            phase={phase}
            secondsLeft={secondsLeft}
            totalSeconds={phaseTotal(phase)}
            running={running}
            pomodorosCompleted={pomodorosCompleted}
            interruptions={interruptions}
            onToggle={() => setRunning((r) => !r)}
            onReset={reset}
            onDistraction={() => setInterruptions((i) => i + 1)}
            onComplete={() => taskId && completeTask.mutate(taskId)}
            showComplete={!!taskId}
          />

          <motion.div
            animate={{ opacity: uiDimmed ? 0.2 : 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <Button variant="ghost" onClick={() => setShowSummary(true)}>
              End session
            </Button>
          </motion.div>
        </div>

        {/* Lofi Player */}
        <FocusLofiPlayer dimmed={uiDimmed} />
      </div>

      {/* Session summary */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card padding="lg" className="w-full max-w-sm text-center shadow-apple-lg" variant="glass">
                <div className="text-4xl">🎯</div>
                <h2 className="type-heading-1 mt-4 text-text-primary">Session complete</h2>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Focused', value: `${totalMinutes}m` },
                    { label: 'Pomodoros', value: pomodorosCompleted },
                    { label: 'Distractions', value: interruptions },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-md border border-border bg-muted p-3"
                    >
                      <p className="font-display text-heading-1 text-primary">{stat.value}</p>
                      <p className="type-caption mt-1 text-text-tertiary">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="primary"
                  className="mt-6 w-full"
                  onClick={() => {
                    setShowSummary(false);
                    reset();
                  }}
                >
                  Close
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
