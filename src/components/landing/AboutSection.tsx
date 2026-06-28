'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden px-6 py-24 md:px-12 md:py-36"
      style={{
        background: 'linear-gradient(180deg, rgb(5,5,8) 0%, rgb(8,8,14) 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative mx-auto max-w-2xl text-center"
      >
        {/* Eyebrow */}
        <p
          className="mb-8 text-[11px] font-semibold uppercase"
          style={{ color: 'rgba(79, 70, 229, 0.8)', letterSpacing: '0.12em' }}
        >
          Our philosophy
        </p>

        {/* Quote-style heading */}
        <h2
          className="font-display text-balance"
          style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            lineHeight: 1.15,
          }}
        >
          &ldquo;Built for calm
          <br />
          productivity.&rdquo;
        </h2>

        <p
          className="mx-auto mt-8 max-w-lg text-[16px] leading-[1.75]"
          style={{ color: 'rgba(255, 255, 255, 0.38)' }}
        >
          LifeSaver was designed with one belief: your tools should recede so your
          work comes forward. No visual noise. No cluttered dashboards. Just
          intelligent assistance that helps you show up, focus, and finish what
          matters.
        </p>

        <Link
          href="/auth"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-full px-7 text-[15px] font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #00D9FF 0%, #4F46E5 100%)',
            color: '#FFFFFF',
          }}
        >
          Get started free
        </Link>
      </motion.div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer
      className="flex flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row md:px-12"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <span
        className="font-display text-[15px] font-bold"
        style={{
          background: 'linear-gradient(135deg, #00D9FF 0%, #4F46E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        LifeSaver
      </span>
      <span className="text-[13px]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
        © 2026 LifeSaver · Powered by Gemini AI
      </span>
      <div className="flex gap-5">
        {['Privacy', 'Terms', 'Contact'].map((item) => (
          <a
            key={item}
            href="#"
            className="text-[13px] transition-colors hover:text-white/60"
            style={{ color: 'rgba(255, 255, 255, 0.22)' }}
          >
            {item}
          </a>
        ))}
      </div>
    </footer>
  );
}
