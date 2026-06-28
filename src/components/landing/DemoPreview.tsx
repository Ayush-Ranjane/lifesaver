'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Inbox,
  Calendar,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FLOATING_STATS = [
  {
    label: 'Tasks Today',
    value: '12',
    accent: 'rgba(0, 217, 255, 1)',
    accentBg: 'rgba(0, 217, 255, 0.08)',
    icon: CheckCircle2,
    offset: 'left-[-40px] top-[25%]',
  },
  {
    label: 'Focus Streak',
    value: '14d',
    accent: 'rgba(16, 185, 129, 1)',
    accentBg: 'rgba(16, 185, 129, 0.08)',
    icon: Flame,
    offset: 'right-[-40px] top-[25%]',
  },
];

function MacWindowDot({ color }: { color: string }) {
  return (
    <span
      className="h-3 w-3 rounded-full"
      style={{ background: color }}
    />
  );
}

function DashboardMockup() {
  const tasks = [
    { title: 'Ship Q3 roadmap', priority: 'rgba(239, 68, 68, 1)', tag: 'Work' },
    { title: 'Review design system', priority: 'rgba(0, 217, 255, 1)', tag: 'Design' },
    { title: 'Call with mentor', priority: 'rgba(245, 158, 11, 1)', tag: 'Personal' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* macOS-style window chrome */}
      <div
        className="flex h-10 flex-shrink-0 items-center gap-2 border-b px-4"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.06)',
          background: 'rgba(13, 13, 20, 0.6)',
        }}
      >
        <MacWindowDot color="#FF5F57" />
        <MacWindowDot color="#FFBD2E" />
        <MacWindowDot color="#28CA41" />
        <div className="mx-auto flex items-center gap-1.5">
          <LayoutDashboard
            className="h-3.5 w-3.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          />
          <span
            className="text-[12px] font-medium"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            LifeSaver — Dashboard
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5 sm:p-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Inbox', value: 8, icon: Inbox },
            { label: 'Calendar', value: 3, icon: Calendar },
            { label: 'Focus', value: '1h', icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Icon
                className="mb-1.5 h-3.5 w-3.5"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              />
              <p
                className="text-[10px] font-medium uppercase"
                style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em' }}
              >
                {label}
              </p>
              <p
                className="font-mono text-[18px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Task list */}
        <div className="flex-1 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <p
            className="border-b px-4 py-2.5 text-[10px] font-semibold uppercase"
            style={{
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.1em',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            Active Tasks
          </p>
          <div className="p-2 space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: task.priority, boxShadow: `0 0 6px ${task.priority}` }}
                />
                <span
                  className="flex-1 text-[13px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.82)' }}
                >
                  {task.title}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {task.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="demo" ref={ref} className="relative px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[820px]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{ perspective: '1400px' }}
        >
          {/* Glow behind window */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-12 rounded-[40px] opacity-50"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 217, 255, 0.12) 0%, rgba(79, 70, 229, 0.08) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Main window */}
          <motion.div
            initial={{ rotateX: 25, opacity: 0, scale: 0.95 }}
            animate={inView ? { rotateX: 12, opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[24px]"
            style={{
              transformStyle: 'preserve-3d',
              background: 'rgba(9, 9, 14, 0.85)',
              backdropFilter: 'blur(32px) saturate(2)',
              WebkitBackdropFilter: 'blur(32px) saturate(2)',
              border: '1px solid rgba(0, 217, 255, 0.15)',
              boxShadow:
                '0 50px 150px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Top shine */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.18) 50%, transparent 95%)',
              }}
            />

            <div className="h-[400px] sm:h-[460px]">
              <DashboardMockup />
            </div>
          </motion.div>

          {/* Floating stat cards */}
          {FLOATING_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, x: i === 0 ? -10 : 10 }}
              animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn('absolute hidden sm:block', stat.offset)}
              style={{
                animation: inView ? `float-gentle ${6 + i * 2}s ease-in-out ${i * 1.5}s infinite` : 'none',
              }}
            >
              <div
                className="rounded-2xl px-4 py-3 min-w-[130px]"
                style={{
                  background: 'rgba(9, 9, 14, 0.95)',
                  backdropFilter: 'blur(32px) saturate(2)',
                  WebkitBackdropFilter: 'blur(32px) saturate(2)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0,217,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: stat.accentBg }}
                  >
                    <stat.icon className="h-3.5 w-3.5" style={{ color: stat.accent }} />
                  </div>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {stat.label}
                  </span>
                </div>
                <p
                  className="mt-2 font-display text-[28px] font-bold"
                  style={{ color: stat.accent, letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
