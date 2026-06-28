'use client';
// ─── Weekly Audit Reminder Banner ─────────────────────────────────────────────
// Shows on dashboard Sunday evenings or if no audit generated this week.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLatestAudit } from '@/hooks/useWeeklyAudit';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WeeklyAuditReminder() {
  const { data: audit } = useLatestAudit();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isEvening = now.getHours() >= 18;
    if (typeof window === 'undefined') return false;
    const wasDismissed = sessionStorage.getItem('auditReminderDismissed') === 'true';

    return isSunday && isEvening && !audit && !wasDismissed;
  }, [audit]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('auditReminderDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {shouldShow && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="glass border border-violet-500/30 bg-violet-500/5 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">Your weekly life audit is ready</p>
              <p className="text-xs text-muted-foreground">Sunday check-in: reflect on your week and set goals for next week</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/audit" className="btn-primary text-xs py-1.5 px-3">
              View Audit →
            </Link>
            <button onClick={dismiss} className="btn-ghost p-1.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
