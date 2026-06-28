'use client';
import { useTaskList } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/authStore';
import { computeFocusScore, getPeakProductivityHours } from '@/lib/analytics';
import { apiFetchBlob, getGradeColor, cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { BarChart3, Download, TrendingUp, Clock, Target, Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useState } from 'react';

const CATEGORY_COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6b7280'];
export function AnalyticsPage() {
  const { data: tasks = [], isLoading } = useTaskList();
  const { userProfile } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  const focusScore = computeFocusScore(tasks, userProfile?.currentStreak ?? 0, 'week');
  const peakData = getPeakProductivityHours(tasks);

  // Completion rate — last 7 days
  const last7 = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const due = tasks.filter(t => format(t.deadline, 'yyyy-MM-dd') === dayStr);
    const done = tasks.filter(t => t.completedAt && format(t.completedAt, 'yyyy-MM-dd') === dayStr);
    return {
      day: format(day, 'EEE'),
      completed: done.length,
      due: due.length,
      rate: due.length > 0 ? Math.round((done.length / due.length) * 100) : 0,
    };
  });

  // Category breakdown
  const categoryMap = tasks.reduce<Record<string, number>>((acc, t) => {
    if (t.status === 'completed') acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Peak hours chart (0-23)
  const hourlyData = peakData.hourlyCompletions.map((count, hour) => ({
    hour: hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`,
    completions: count,
  })).filter((_, i) => i >= 6 && i <= 22); // 6am–10pm range



  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await apiFetchBlob('/api/analytics/export?format=csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifesaver-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } catch {
      // toast shown by apiFetch
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Last 7 days performance</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary gap-2">
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* AI Insight */}


      {/* Focus Score Card */}
      <div className="gradient-border p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Weekly Focus Score
            </p>
            <div className="flex items-baseline gap-3">
              <span className={cn('text-6xl font-black', getGradeColor(focusScore.grade))}>
                {focusScore.grade}
              </span>
              <span className="text-3xl font-bold text-foreground">{focusScore.score}/100</span>
            </div>
          </div>
          <div className="space-y-3 text-right">
            {[
              { label: 'On-time rate', value: `${Math.round(focusScore.onTimeCompletionRate*100)}%`, icon: TrendingUp },
              { label: 'Streak bonus', value: `${Math.round(focusScore.streakBonus*100)}%`, icon: Flame },
              { label: 'Overdue reduction', value: `${Math.round(focusScore.overdueReductionRate*100)}%`, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold w-12 text-right">{value}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Completion rate chart */}
        <div className="glass p-5">
          <h3 className="font-semibold mb-4">Daily Completions (7d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 47% 10%)', border: '1px solid hsl(217 33% 20%)', borderRadius: 12 }}
              />
              <Bar dataKey="completed" fill="hsl(252 87% 67%)" radius={[4,4,0,0]} name="Completed" />
              <Bar dataKey="due" fill="hsl(217 33% 20%)" radius={[4,4,0,0]} name="Due" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="glass p-5">
          <h3 className="font-semibold mb-4">Tasks by Category</h3>
          {categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Complete tasks to see breakdown</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222 47% 10%)', border: '1px solid hsl(217 33% 20%)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-muted-foreground capitalize flex-1">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Peak hours heatmap */}
        <div className="glass p-5 md:col-span-2">
          <h3 className="font-semibold mb-4">Peak Productivity Hours</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(252 87% 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(252 87% 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(222 47% 10%)', border: '1px solid hsl(217 33% 20%)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="completions" stroke="hsl(252 87% 67%)" fill="url(#peakGrad)" strokeWidth={2} name="Completions" />
            </AreaChart>
          </ResponsiveContainer>
          {peakData.peakHour > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              🏆 Your peak hour is <strong className="text-foreground">
                {peakData.peakHour < 12 ? `${peakData.peakHour}am` : `${peakData.peakHour-12 || 12}pm`}
              </strong> — schedule deep work then!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
