'use client';

import { useMemo } from 'react';
import { isToday, isPast } from 'date-fns';
import { CheckCircle2, Flame, Timer, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskList } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/authStore';
import { prioritizeTasksForToday } from '@/lib/ai/prioritize';
import { computeFocusScore } from '@/lib/analytics';
import { WeeklyAuditReminder } from '@/components/WeeklyAuditReminder';
import {
  DashboardHeader,
  DashboardStatCard,
  ActiveTasksWidget,
  PomodoroWidget,
  UpcomingCalendarWidget,
  HabitSnapshotWidget,
} from '@/components/dashboard';

export function DashboardPage() {
  const { userProfile } = useAuthStore();
  const { data: tasks = [], isLoading } = useTaskList();

  const stats = useMemo(() => {
    const active = tasks.filter(
      (t) => !t.isArchived && t.status !== 'completed' && t.status !== 'cancelled'
    );
    const todayAll = tasks.filter(
      (t) => isToday(t.deadline) && t.status !== 'cancelled' && !t.isArchived
    );
    const todayPending = todayAll.filter(
      (t) => t.status !== 'completed'
    );
    const completedToday = tasks.filter(
      (t) => t.completedAt && isToday(t.completedAt)
    );
    const focusMinutesToday = completedToday.reduce(
      (sum, t) => sum + (t.actualMinutes ?? t.estimatedMinutes ?? 0),
      0
    );
    const focusHours = (focusMinutesToday / 60).toFixed(1);

    const focusScore = computeFocusScore(tasks, userProfile?.currentStreak ?? 0, 'week');
    const completionRate = Math.round(focusScore.onTimeCompletionRate * 100);

    const activeTasks = userProfile
      ? prioritizeTasksForToday(tasks, userProfile)
          .slice(0, 6)
          .map((p) => p.task)
      : active
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 6);

    const upcoming = [...active]
      .filter((t) => !isPast(t.deadline) || isToday(t.deadline))
      .sort(
        (a, b) =>
          new Date(a.scheduledStart ?? a.deadline).getTime() -
          new Date(b.scheduledStart ?? b.deadline).getTime()
      )
      .slice(0, 4);

    return {
      todayPending,
      completedToday,
      focusHours,
      completionRate,
      activeTasks,
      upcoming,
      pendingCount: active.length,
    };
  }, [tasks, userProfile]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-16 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-[120px] rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-64 rounded-lg" />
          <div className="skeleton h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <WeeklyAuditReminder />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardHeader
          name={userProfile?.displayName}
          pendingCount={stats.pendingCount}
          completedTodayCount={stats.completedToday.length}
        />
      </motion.div>

      {/* Stat cards — 4 across */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard
          label="Tasks Today"
          value={stats.todayPending.length}
          footer={`${stats.completedToday.length} done so far`}
          icon={CheckCircle2}
          accent="cyan"
        />
        <DashboardStatCard
          label="Current Streak"
          value={`${userProfile?.currentStreak ?? 0}d`}
          footer={
            (userProfile?.currentStreak ?? 0) > 0 ? 'Keep the momentum' : 'Start a streak today'
          }
          icon={Flame}
          accent="success"
        />
        <DashboardStatCard
          label="Focus Time"
          value={`${stats.focusHours}h`}
          footer="Logged today"
          icon={Timer}
          accent="indigo"
        />
        <DashboardStatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          footer="On-time this week"
          icon={TrendingUp}
          accent="warning"
        />
      </motion.div>

      {/* Active tasks — full width hero position */}
      <motion.div variants={itemVariants}>
        <ActiveTasksWidget tasks={stats.activeTasks} />
      </motion.div>

      {/* Secondary widgets — 2-column grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <PomodoroWidget />
        <UpcomingCalendarWidget tasks={stats.upcoming} />
      </motion.div>

      {/* Tertiary row */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <HabitSnapshotWidget />
      </motion.div>
    </motion.div>
  );
}
