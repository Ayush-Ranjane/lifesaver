'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: '/mo',
    desc: 'Core productivity for individuals getting started.',
    features: ['AI task parsing', 'Inbox & calendar', 'Habits tracking', 'Basic reminders'],
    cta: 'Get started free',
    href: '/auth',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '12',
    period: '/mo',
    desc: 'For focused professionals who ship consistently.',
    features: ['Goals & analytics', 'Advanced AI insights', 'Calendar sync', 'Priority support'],
    cta: 'Start Pro trial',
    href: '/auth',
    highlighted: true,
  },
  {
    name: 'Power',
    price: '24',
    period: '/mo',
    desc: 'Deep focus and AI coaching for peak performance.',
    features: ['Focus Mode', 'AI Coach console', 'Team collaboration', 'Custom integrations'],
    cta: 'Go Power',
    href: '/auth',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative px-6 py-24 md:px-12 md:py-36"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0, 217, 255, 0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p
            className="mb-4 text-[11px] font-semibold uppercase"
            style={{ color: 'rgba(0, 217, 255, 0.7)', letterSpacing: '0.12em' }}
          >
            Pricing
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            Simple, honest pricing
          </h2>
          <p
            className="mx-auto mt-5 max-w-md text-[16px]"
            style={{ color: 'rgba(255, 255, 255, 0.38)' }}
          >
            Start free. Upgrade when you&apos;re ready to go deeper.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col overflow-hidden rounded-[28px] p-7"
              style={
                plan.highlighted
                  ? {
                      background: 'rgba(9, 9, 14, 0.9)',
                      backdropFilter: 'blur(32px) saturate(2)',
                      WebkitBackdropFilter: 'blur(32px) saturate(2)',
                      border: '1px solid rgba(0, 217, 255, 0.4)',
                      boxShadow:
                        '0 0 100px rgba(0, 217, 255, 0.15), 0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }
                  : {
                      background: 'rgba(13, 13, 20, 0.4)',
                      backdropFilter: 'blur(20px) saturate(1.6)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }
              }
              whileHover={!plan.highlighted ? { y: -4, borderColor: 'rgba(255,255,255,0.1)', transition: { duration: 0.2 } } : { scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* Top inset highlight on Pro */}
              {plan.highlighted && (
                <div
                  aria-hidden
                  className="absolute inset-x-12 top-0 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.5), transparent)',
                  }}
                />
              )}

              {/* Popular badge */}
              {plan.highlighted && (
                <div className="mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid rgba(0, 217, 255, 0.25)',
                      color: 'rgba(0, 217, 255, 0.9)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span className="h-1 w-1 rounded-full bg-cyan" />
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className="text-[13px] font-semibold uppercase"
                style={{
                  color: plan.highlighted
                    ? 'rgba(0, 217, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.38)',
                  letterSpacing: '0.08em',
                }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className="font-mono text-[48px] font-bold leading-none"
                  style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}
                >
                  ${plan.price}
                </span>
                <span
                  className="text-[14px]"
                  style={{ color: 'rgba(255, 255, 255, 0.28)' }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                className="mt-3 text-[14px] leading-[1.6]"
                style={{ color: 'rgba(255, 255, 255, 0.38)' }}
              >
                {plan.desc}
              </p>

              {/* Divider */}
              <div
                className="my-6 h-px"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              />

              {/* Features */}
              <motion.ul 
                className="flex-1 space-y-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {plan.features.map((f) => (
                  <motion.li
                    key={f}
                    variants={fadeUp}
                    className="flex items-center gap-3 text-[14px]"
                    style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                  >
                    <Check
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{
                        color: plan.highlighted
                          ? 'rgba(0, 217, 255, 0.9)'
                          : 'rgba(255, 255, 255, 0.3)',
                      }}
                    />
                    {f}
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="mt-8 flex h-11 items-center justify-center rounded-full text-[14px] font-semibold transition-all duration-200"
                style={
                  plan.highlighted
                    ? {
                        background: 'linear-gradient(135deg, #00D9FF 0%, #4F46E5 100%)',
                        color: '#FFFFFF',
                      }
                    : {
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.65)',
                      }
                }
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
