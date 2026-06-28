import type { Transition, Variants } from 'framer-motion';

/** LifeSaver motion tokens — spring physics & entrance/exit presets */

export const spring = {
  stiff: { type: 'spring' as const, stiffness: 300, damping: 24 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
} satisfies Record<string, Transition>;

export const duration = {
  fast: 0.15,
  normal: 0.2,
  entrance: 0.35,
  exit: 0.2,
  page: 0.3,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.entrance, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.exit, ease: 'easeIn' },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.entrance } },
  exit: { opacity: 0, transition: { duration: duration.exit } },
};

export const slideAxis: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.page, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: duration.exit },
  },
};

export const hoverLift = {
  rest: { y: 0, boxShadow: 'var(--shadow-elevation-1)' },
  hover: {
    y: -2,
    boxShadow: 'var(--shadow-hover-lift)',
    transition: { duration: duration.fast },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const reducedMotionTransition: Transition = {
  duration: 0,
};

/** Returns spring or instant transition based on user preference */
export function motionSafe(transition: Transition): Transition {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return reducedMotionTransition;
  }
  return transition;
}
