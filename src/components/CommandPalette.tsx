'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskList } from '@/hooks/useTasks';
import { useUIStore } from '@/store/uiStore';
import { useInboxReviewStore } from '@/store/inboxReviewStore';
import { useGitHubImportStore } from '@/hooks/useGitHubIntegration';
import { useGmailScan } from '@/hooks/useGmailIntegration';
import { useFutureLetterStore } from '@/store/futureLetterStore';
import {
  Search, Plus, LayoutDashboard, Inbox, Calendar, Target, Flame,
  BarChart3, Zap, Settings, Mail, GitBranch, Loader2,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Habits', href: '/habits', icon: Flame },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Focus', href: '/focus', icon: Zap },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const openModal = useUIStore((s) => s.openModal);
  const openReview = useInboxReviewStore((s) => s.openReview);
  const openGitHub = useGitHubImportStore((s) => s.openPanel);
  const openFutureLetter = useFutureLetterStore((s) => s.open);
  const { refetch: scanGmail, isFetching: scanningGmail } = useGmailScan();
  const { data: tasks = [] } = useTaskList();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const q = query.toLowerCase();
  const matchedTasks = tasks
    .filter((t) => !t.isArchived && t.title.toLowerCase().includes(q))
    .slice(0, 5);
  const matchedNav = NAV.filter((n) => n.label.toLowerCase().includes(q));

  const run = (fn: () => void) => {
    fn();
    close();
  };

  const handleGmailScan = async () => {
    const result = await scanGmail();
    const tasks = result.data ?? [];
    if (tasks.length > 0) openReview(tasks);
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg glass rounded-2xl border border-border shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, pages, actions..."
            className="flex-1 py-4 bg-transparent outline-none text-sm"
          />
          <kbd className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">Actions</p>
              <button onClick={() => run(() => openModal('task-create'))} className="cmd-item">
                <Plus className="w-4 h-4" /> New Task
              </button>
              <button onClick={handleGmailScan} disabled={scanningGmail} className="cmd-item">
                {scanningGmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Scan Gmail Inbox
              </button>
              <button onClick={() => run(openGitHub)} className="cmd-item">
                <GitBranch className="w-4 h-4" /> Import GitHub Issues
              </button>
              <button onClick={() => run(openFutureLetter)} className="cmd-item">
                <Target className="w-4 h-4" /> Write Future Self Letter
              </button>
            </div>
          )}

          {matchedNav.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">Pages</p>
              {matchedNav.map((item) => (
                <button key={item.href} onClick={() => run(() => router.push(item.href))} className="cmd-item">
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          )}

          {matchedTasks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">Tasks</p>
              {matchedTasks.map((task) => (
                <button
                  key={task.taskId}
                  onClick={() => run(() => router.push(`/tasks/${task.taskId}`))}
                  className="cmd-item"
                >
                  <Inbox className="w-4 h-4" />
                  <span className="truncate">{task.title}</span>
                </button>
              ))}
            </div>
          )}

          {query && matchedNav.length === 0 && matchedTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  );
}
