'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const ORBS = [
  {
    color: 'rgba(255, 255, 255, 0.05)',
    size: 900,
    x: '50%',
    y: '0%',
    duration: 30,
    blur: '140px',
  },
  {
    color: 'rgba(124, 58, 237, 0.08)',
    size: 700,
    x: '20%',
    y: '40%',
    duration: 25,
    blur: '120px',
  },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-28 text-center md:px-12">
      {/* Background noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Ambient orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
            filter: `blur(${orb.blur})`,
          }}
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -20, 12, 0],
            scale: [1, 1.04, 0.97, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Centered radial spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0, 217, 255, 0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center"
      >
        {/* Eyebrow label */}
        <motion.div variants={fadeUp}>
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              AI-Powered Life Management
            </span>
          </div>
        </motion.div>

        {/* Display heading */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-balance leading-[1.05]"
          style={{
            fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            color: '#FFFFFF',
          }}
        >
          Your life, finally{' '}
          <span
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            under control.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="mt-7 max-w-[520px] text-[17px] leading-[1.65]"
          style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 400 }}
        >
          LifeSaver uses Gemini AI to parse your tasks in plain English, schedule
          your day intelligently, and keep you deeply focused — so nothing important
          ever slips through.
        </motion.p>

        {/* CTA row */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/auth"
            className="flex items-center justify-center rounded-full font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 1)',
              color: '#000',
              fontSize: '15px',
              padding: '0 2rem',
              height: '3.25rem',
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            Get started free
          </Link>
          <a
            href="#demo"
            className="rounded-full px-5 text-[15px] font-medium transition-colors hover:text-white"
            style={{
              height: '2.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            See it in action ↓
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.p
          variants={fadeUp}
          className="mt-10 text-[13px]"
          style={{ color: 'rgba(255, 255, 255, 0.22)' }}
        >
          Trusted by{' '}
          <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>40,000+</span>{' '}
          focused people · Free to start · No credit card
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background: 'linear-gradient(to top, rgb(5, 5, 8), transparent)',
        }}
      />
    </section>
  );
}
