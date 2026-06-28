'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export function LandingNav() {
  const { scrollY } = useScroll();
  const pillOpacity = useTransform(scrollY, [0, 60], [0.9, 1]);
  const pillScale = useTransform(scrollY, [0, 60], [0.98, 1]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        className="flex items-center gap-6 rounded-full px-4 py-2.5"
        style={{
          opacity: pillOpacity,
          scale: pillScale,
          background: 'rgba(9, 9, 11, 0.65)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pr-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan shadow-[0_0_12px_rgba(0,217,255,1)]" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-white">LifeSaver</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white/55 transition-colors duration-150 hover:text-white/90 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 pl-2">
          <Link
            href="/auth"
            className="hidden text-[13px] font-medium text-white/55 transition-colors hover:text-white/90 md:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all hover:shadow-[0_0_24px_rgba(0,217,255,0.4)] hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(0,217,255,0.2) 0%, rgba(79,70,229,0.2) 100%)',
              border: '1px solid rgba(0,217,255,0.4)',
              boxShadow: '0 0 16px rgba(0, 217, 255, 0.2)',
            }}
          >
            Get started free
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}
