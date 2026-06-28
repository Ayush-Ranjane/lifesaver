'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, cn } from '@/lib/utils';
import type { NotificationRecord } from '@/types';
import { Bell, CheckCheck, Clock, AlertTriangle, Sparkles, Users, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const TYPE_ICONS = {
  reminder:   <Clock className="w-4 h-4 text-blue-400" />,
  overdue:    <AlertTriangle className="w-4 h-4 text-red-400" />,
  escalation: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  ai_insight: <Sparkles className="w-4 h-4 text-violet-400" />,
  system:     <Bell className="w-4 h-4 text-muted-foreground" />,
  team:       <Users className="w-4 h-4 text-cyan-400" />,
  streak:     <Trophy className="w-4 h-4 text-amber-400" />,
  goal:       <Trophy className="w-4 h-4 text-emerald-400" />,
};

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<NotificationRecord[]>('/api/notifications'),
  });

  const markRead = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify({ ids, action: 'mark_read' }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Notifications
          {unreadCount > 0 && (
            <span className="badge bg-primary/20 border-primary/30 text-primary">{unreadCount} new</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markRead.mutate(notifications.filter(n => !n.isRead).map(n => n.notificationId))}
            className="btn-ghost text-sm gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <Link
              key={notif.notificationId}
              href={notif.deepLink ?? '/dashboard'}
              onClick={() => !notif.isRead && markRead.mutate([notif.notificationId])}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-secondary/40 block',
                notif.isRead ? 'border-transparent opacity-70' : 'border-border bg-card'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                {TYPE_ICONS[notif.type] ?? <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', !notif.isRead && 'text-foreground')}>{notif.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
