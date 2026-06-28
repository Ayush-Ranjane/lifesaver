'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Plus, Search, Mail, Loader2, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/utils';
import { getPageTitle } from '@/lib/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import type { NotificationRecord } from '@/types';

function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
}

export function TopBar() {
  const pathname = usePathname();
  const { openModal, setMobileNav } = useUIStore();
  const { userProfile, firebaseUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendSummary = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      if (!firebaseUser) throw new Error('Not logged in');
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/email/summary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to send');
      toast.success('Briefing sent to your email!');
    } catch (e) {
      toast.error('Could not send email');
    } finally {
      setIsSending(false);
    }
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<NotificationRecord[]>('/api/notifications'),
    staleTime: 60_000,
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pageTitle = getPageTitle(pathname);

  // Check if we are on the focus page
  const isFocusActive = pathname === '/focus';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-[49] flex h-[52px] items-center gap-3 px-5',
        'apple-glass-strong border-b border-[var(--glass-border)]',
        'left-0 lg:left-[240px]',
        'shadow-apple-md'
      )}
    >
      {/* Mobile menu */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 hover:bg-[var(--glass-mid)] hover:scale-105 lg:hidden"
        onClick={() => setMobileNav(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4 text-text-tertiary" />
      </button>

      {/* LEFT: Page title */}
      <div className="min-w-0 flex-shrink-0">
        <h1 className="truncate text-[14px] font-semibold text-text-primary">
          {pageTitle}
        </h1>
      </div>

      {/* CENTER: Global search */}
      <div className="mx-auto hidden max-w-[380px] flex-1 md:block">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex h-8 w-full items-center gap-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-left shadow-apple-sm backdrop-blur-apple transition-all duration-300 hover:border-[var(--glass-border-active)] hover:shadow-apple-md hover:scale-[1.01]"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-text-tertiary" />
          <span className="flex-1 text-[13px] text-text-tertiary">
            Search...
          </span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* RIGHT: Actions */}
      <div className="ml-auto flex flex-shrink-0 items-center gap-2">
        {/* Focus Status Chip */}
        {isFocusActive && (
          <Link
            href="/focus"
            className="hidden sm:flex items-center gap-2 px-3 h-7 bg-accent-green/8 rounded-md border border-accent-green/15 hover:bg-accent-green/12 transition-colors"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green"></span>
            </span>
            <span className="text-accent-green text-[12px] font-medium font-mono">In Focus</span>
          </Link>
        )}

        {/* New task button */}
        <button
          onClick={() => openModal('task-create')}
          className="hidden h-8 items-center gap-1.5 rounded-full bg-accent-gradient px-4 text-[13px] font-semibold text-white shadow-apple-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover-lift sm:flex"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </button>
        <button
          onClick={() => openModal('task-create')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gradient text-white shadow-apple-sm transition-all duration-300 hover:scale-105 sm:hidden"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Send Summary button */}
        <button
          onClick={handleSendSummary}
          disabled={isSending}
          className="hidden h-8 items-center gap-1.5 rounded-md bg-surface-3 px-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface-4 sm:flex disabled:opacity-50"
          title="Send Daily Briefing"
        >
          {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 text-violet-400" />}
          Briefing
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-all duration-300 hover:bg-[var(--glass-mid)] hover:scale-105"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-all duration-300 hover:bg-[var(--glass-mid)] hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-inverse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link href="/settings" className="flex-shrink-0">
          {firebaseUser?.photoURL ? (
            <Image
              src={firebaseUser.photoURL}
              alt="Profile"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border border-border"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/15 text-[11px] font-bold text-primary">
              {(userProfile?.displayName || 'U')[0].toUpperCase()}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
