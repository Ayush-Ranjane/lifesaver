'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw } from 'lucide-react';

const WORK_SECS = 25 * 60;
const CIRCUMFERENCE = 2 * Math.PI * 80;

export function PomodoroWidget() {
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);

  const tick = useCallback(() => {
    setSecondsLeft((s) => (s <= 1 ? WORK_SECS : s - 1));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  const progress = 1 - secondsLeft / WORK_SECS;
  const mins = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm text-center">
      <div className="mb-1">
        <h3 className="text-[14px] font-semibold text-text-primary">Quick Focus</h3>
        <p className="text-[13px] text-text-tertiary">25-minute Pomodoro</p>
      </div>

      <div className="relative mx-auto my-4 h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192" aria-hidden>
          {/* Track circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="rgb(var(--ls-surface-3))"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#2563EB"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[32px] font-semibold tabular-nums text-text-primary tracking-tight">
            {mins}:{secs}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mt-0.5">Focus</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setRunning(false);
            setSecondsLeft(WORK_SECS);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-muted hover:text-text-primary"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 translate-x-0.5" />}
        </button>
      </div>

      <Link
        href="/focus"
        className="mt-4 inline-block text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
      >
        Open Focus Sandbox →
      </Link>
    </div>
  );
}
