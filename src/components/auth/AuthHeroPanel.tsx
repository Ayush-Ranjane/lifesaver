'use client';

import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

const ORBS = [
  { color: 'rgba(0,217,255,0.15)', size: 320, x: '10%', y: '15%', duration: 18 },
  { color: 'rgba(79,70,229,0.2)', size: 400, x: '55%', y: '30%', duration: 22 },
  { color: 'rgba(139,92,246,0.12)', size: 280, x: '30%', y: '60%', duration: 20 },
];

export function AuthHeroPanel() {
  return (
    <div className="relative hidden min-h-screen overflow-hidden bg-void bg-hero-glow lg:flex lg:flex-col lg:justify-between">
      {/* Abstract gradient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,217,255,0.06) 0%, transparent 40%, rgba(79,70,229,0.1) 70%, transparent 100%)',
        }}
        aria-hidden
      />

      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 24, -16, 0],
            y: [0, -20, 12, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Decorative grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      {/* Top brand mark */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-12"
      >
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-gradient shadow-glow-sm" />
          <span className="font-display text-lg font-bold text-text-primary">LifeSaver</span>
        </div>
      </motion.div>

      {/* Quote block */}
      <motion.blockquote
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md p-12"
      >
        <p className="font-display text-3xl font-bold leading-snug tracking-tight text-gradient-apple">
          &ldquo;The interface recedes so your work comes forward.&rdquo;
        </p>
        <footer className="mt-6">
          <p className="type-body-m font-medium text-text-primary">Calm intelligence</p>
          <p className="type-body-m text-text-tertiary">Designed for people who ship.</p>
        </footer>
      </motion.blockquote>
    </div>
  );
}
