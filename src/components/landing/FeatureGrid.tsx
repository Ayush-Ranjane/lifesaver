'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Bell,
  Calendar,
  Zap,
  Target,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';

const FEATURES: {
  icon: LucideIcon;
  title: string;
  desc: string;
  accentColor: string;
  accentBg: string;
  glowColor: string;
  className?: string;
}[] = [
  {
    icon: Brain,
    title: 'AI Task Parsing',
    desc: 'Type anything naturally. Gemini extracts deadline, priority, and category instantly.',
    accentColor: 'rgba(0, 217, 255, 1)',
    accentBg: 'rgba(0, 217, 255, 0.08)',
    glowColor: 'rgba(0, 217, 255, 0.2)',
    className: 'lg:col-span-2',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Effort-aware notifications that escalate before you procrastinate.',
    accentColor: 'rgba(59, 130, 246, 1)',
    accentBg: 'rgba(59, 130, 246, 0.08)',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    className: 'lg:col-span-1',
  },
  {
    icon: Calendar,
    title: 'Calendar Sync',
    desc: 'Bi-directional Google Calendar sync with conflict detection built in.',
    accentColor: 'rgba(16, 185, 129, 1)',
    accentBg: 'rgba(16, 185, 129, 0.08)',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    className: 'lg:col-span-1',
  },
  {
    icon: Zap,
    title: 'Focus Mode',
    desc: 'Pomodoro timer with distraction logging and deep work focus sessions.',
    accentColor: 'rgba(139, 92, 246, 1)',
    accentBg: 'rgba(139, 92, 246, 0.08)',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    className: 'lg:col-span-2',
  },
  {
    icon: Target,
    title: 'Goal Roadmaps',
    desc: 'Set 30/60/90 day goals. AI generates week-by-week milestone plans.',
    accentColor: 'rgba(245, 158, 11, 1)',
    accentBg: 'rgba(245, 158, 11, 0.08)',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    className: 'lg:col-span-2',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Focus score, peak hours heatmap, and weekly AI narrative reports.',
    accentColor: 'rgba(0, 217, 255, 1)',
    accentBg: 'rgba(0, 217, 255, 0.08)',
    glowColor: 'rgba(0, 217, 255, 0.2)',
    className: 'lg:col-span-1',
  },
];

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[0];
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`group relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 ${feature.className || ''}`}
      style={{
        background: 'rgba(9, 9, 14, 0.7)',
        backdropFilter: 'blur(24px) saturate(2)',
        WebkitBackdropFilter: 'blur(24px) saturate(2)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
    >
      {/* Top inset highlight */}
      <div
        aria-hidden
        className="absolute inset-x-8 top-0 h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${feature.accentColor}30, transparent)`,
        }}
      />

      {/* Hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${feature.glowColor} 0%, transparent 60%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Hover border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${feature.accentColor}22 0%, transparent 60%)`,
          border: `1px solid ${feature.accentColor}25`,
        }}
      />

      {/* Icon */}
      <div
        className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{
          background: feature.accentBg,
          boxShadow: `0 0 20px ${feature.glowColor}`,
        }}
      >
        <feature.icon
          className="h-5 w-5"
          style={{ color: feature.accentColor, strokeWidth: 1.5 }}
        />
      </div>

      {/* Text */}
      <h3
        className="relative text-[16px] font-semibold"
        style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em' }}
      >
        {feature.title}
      </h3>
      <p
        className="relative mt-2 text-[14px] leading-[1.65]"
        style={{ color: 'rgba(255,255,255,0.38)' }}
      >
        {feature.desc}
      </p>
    </motion.div>
  );
}

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative px-6 py-24 md:px-12 md:py-36"
      style={{
        background:
          'linear-gradient(180deg, rgb(5, 5, 8) 0%, rgb(10, 10, 16) 50%, rgb(5, 5, 8) 100%)',
      }}
    >
      {/* Section ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(79, 70, 229, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p
            className="mb-4 text-[11px] font-semibold uppercase"
            style={{ color: 'rgba(0, 217, 255, 0.7)', letterSpacing: '0.12em' }}
          >
            Six reasons
          </p>
          <h2
            className="font-display text-balance"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            Everything you need to
            <br />
            stay ahead
          </h2>
          <p
            className="mx-auto mt-5 max-w-md text-[16px] leading-[1.65]"
            style={{ color: 'rgba(255, 255, 255, 0.38)' }}
          >
            Calm intelligence for people who are done missing deadlines and losing focus.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
