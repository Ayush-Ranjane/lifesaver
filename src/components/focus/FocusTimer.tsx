'use client';

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';

const CIRCUMFERENCE = 2 * Math.PI * 120;

type Phase = 'work' | 'break' | 'long_break';

interface FocusTimerProps {
  phase: Phase;
  secondsLeft: number;
  totalSeconds: number;
  running: boolean;
  pomodorosCompleted: number;
  interruptions: number;
  onToggle: () => void;
  onReset: () => void;
  onDistraction: () => void;
  onComplete?: () => void;
  showComplete?: boolean;
}

export function FocusTimer({
  phase,
  secondsLeft,
  totalSeconds,
  running,
  pomodorosCompleted,
  interruptions,
  onToggle,
  onReset,
  onDistraction,
  onComplete,
  showComplete,
}: FocusTimerProps) {
  const progress = 1 - secondsLeft / totalSeconds;
  const mins = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* Phase pill */}
      <div
        className={cn(
          'mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-body-m font-medium',
          phase === 'work' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
        )}
      >
        {phase === 'work' ? <Zap className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
        {phase === 'work' ? 'Focus' : phase === 'break' ? 'Short Break' : 'Long Break'}
      </div>

      {/* 360px timer ring */}
      <div className="relative h-[360px] w-[360px] max-w-[min(360px,85vw)] max-h-[min(360px,85vw)]">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 260 260"
          aria-hidden
        >
          <defs>
            <linearGradient id="focus-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <filter id="focus-ring-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke={phase === 'work' ? 'url(#focus-ring-gradient)' : '#10B981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={`${mins}${secs}`}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.stiff}
            className="font-mono text-6xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-7xl"
          >
            {mins}:{secs}
          </motion.span>
          <span className="type-body-m mt-2 text-text-tertiary">
            {pomodorosCompleted} pomodoro{pomodorosCompleted !== 1 ? 's' : ''} done
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset timer">
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="primary"
          onClick={onToggle}
          className="h-14 w-14 rounded-full p-0"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 translate-x-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDistraction}
          className="text-warning hover:text-warning"
          aria-label="Log distraction"
        >
          <AlertCircle className="h-5 w-5" />
        </Button>

        {showComplete && onComplete && (
          <Button variant="secondary" onClick={onComplete} className="ml-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </Button>
        )}
      </div>

      {interruptions > 0 && (
        <p className="type-body-m mt-4 text-warning">
          {interruptions} distraction{interruptions !== 1 ? 's' : ''} logged
        </p>
      )}
    </div>
  );
}

export type { Phase };
