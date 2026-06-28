'use client';
// ─── Weekly Audit Page ─────────────────────────────────────────────────────────
// Full-page beautiful report of AI-generated weekly life audit.

import { useLatestAudit, useGenerateAudit } from '@/hooks/useWeeklyAudit';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Lightbulb, AlertTriangle, Target, Sparkles,
  Download, Share2, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import Link from 'next/link';

function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 8 ? 'bg-emerald-400/10 border-emerald-400/30' : score >= 5 ? 'bg-amber-400/10 border-amber-400/30' : 'bg-red-400/10 border-red-400/30';
  return (
    <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold', bg, color)}>
      Week Score: {score}/10
    </div>
  );
}

export default function AuditPage() {
  const { userProfile, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { data: audit, isLoading } = useLatestAudit();
  const generate = useGenerateAudit();

  useEffect(() => {
    if (!authLoading && !userProfile) router.replace('/auth');
  }, [authLoading, userProfile, router]);

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (!audit) return;
    const text = `My week in review:\n\n"${audit.headline}"\n\nScore: ${audit.weekScore}/10\n\nNext week I'm focusing on:\n${audit.nextWeekGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\n— via LifeSaver AI`;
    navigator.clipboard.writeText(text);
  };

  const now = new Date();
  const weekRange = `${format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(now, { weekStartsOn: 1 }), 'MMM d, yyyy')}`;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your weekly audit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Full-page no-sidebar layout */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="btn-ghost text-sm">← Dashboard</Link>
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-secondary text-sm gap-1.5">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={handlePrint} className="btn-secondary text-sm gap-1.5">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="btn-secondary text-sm gap-1.5"
            >
              <RefreshCw className={cn('w-4 h-4', generate.isPending && 'animate-spin')} />
              Regenerate
            </button>
          </div>
        </div>

        {!audit && !generate.isPending ? (
          /* No audit yet */
          <div className="glass rounded-3xl p-16 text-center space-y-4">
            <Sparkles className="w-14 h-14 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">No audit for this week yet</h1>
            <p className="text-muted-foreground">Generate your personalized AI life audit — it takes about 10 seconds.</p>
            <button onClick={() => generate.mutate()} className="btn-primary">
              <Sparkles className="w-4 h-4" /> Generate Weekly Audit
            </button>
          </div>
        ) : generate.isPending ? (
          <div className="glass rounded-3xl p-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Gemini AI is analyzing your week...</p>
          </div>
        ) : audit ? (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="text-sm text-muted-foreground">{weekRange}</p>
              <h1 className="text-3xl md:text-4xl font-black leading-tight gradient-text">{audit.headline}</h1>
              <ScoreDisplay score={audit.weekScore} />
            </motion.div>

            {/* Wins */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-lg">This Week&apos;s Wins</h2>
              </div>
              <div className="grid gap-3">
                {audit.wins.map((win, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="glass rounded-xl p-4 flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/5"
                  >
                    <span className="text-emerald-400 mt-0.5 text-lg">✓</span>
                    <p className="text-sm font-medium">{win}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Patterns */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-lg">Patterns Noticed</h2>
              </div>
              <div className="grid gap-3">
                {audit.patterns.map((pattern, i) => (
                  <div key={i} className="glass rounded-xl p-4 flex items-start gap-3 border border-amber-500/20 bg-amber-500/5">
                    <span className="text-amber-400 mt-0.5">💡</span>
                    <p className="text-sm">{pattern}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Avoidances */}
            {audit.avoidances.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="font-bold text-lg">What You Avoided</h2>
                </div>
                <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5 space-y-2">
                  {audit.avoidances.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-400 flex-shrink-0">⚠</span> {item}
                    </p>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Next Week Goals */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Next Week&apos;s Focus Goals</h2>
              </div>
              <div className="grid gap-3">
                {audit.nextWeekGoals.map((goal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass rounded-xl p-4 flex items-start gap-4"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{goal}</p>
                    </div>
                    <Link
                      href={`/goals?prefill=${encodeURIComponent(goal)}`}
                      className="text-xs text-primary hover:underline flex-shrink-0 mt-0.5"
                    >
                      Add as Goal →
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Closing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center pt-4"
            >
              <p className="text-muted-foreground italic text-sm max-w-md mx-auto">{audit.closingNote}</p>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}
