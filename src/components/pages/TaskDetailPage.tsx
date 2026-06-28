'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft, CheckCircle2, Circle, Trash2, Timer, Calendar,
  Loader2, Save, Brain
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProcrastinationStore } from '@/store/procrastinationStore';
import {
  useTask, useUpdateTask, useCompleteTask, useSnoozeTask, useDeleteTask,
} from '@/hooks/useTasks';
import { useBlockCalendar } from '@/hooks/useCalendarIntegration';
import {
  cn, PRIORITY_COLORS, CATEGORY_ICONS, formatDeadline,
} from '@/lib/utils';
import type { TaskPriority, TaskCategory, TaskEffort } from '@/types';

export function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const { data: task, isLoading, error } = useTask(taskId);
  const updateTask = useUpdateTask();
  const complete = useCompleteTask();
  const snooze = useSnoozeTask();
  const del = useDeleteTask();
  const blockCalendar = useBlockCalendar();
  const { openModal } = useUIStore();
  const { setCoachingTask } = useProcrastinationStore();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('other');

  const startEditing = () => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDeadline(format(task.deadline, "yyyy-MM-dd'T'HH:mm"));
    setPriority(task.priority);
    setCategory(task.category);
    setEditing(true);
  };

  const handleSave = () => {
    updateTask.mutate(
      {
        taskId,
        updates: {
          title,
          description,
          deadline: new Date(deadline),
          priority,
          category,
          _currentRescheduleCount: task?.rescheduleCount ?? 0,
        } as Parameters<typeof updateTask.mutate>[0]['updates'],
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const toggleSubtask = (subtaskId: string) => {
    if (!task) return;
    const subtasks = task.subtasks.map((s) =>
      s.subtaskId === subtaskId
        ? { ...s, status: s.status === 'done' ? 'pending' as const : 'done' as const }
        : s,
    );
    updateTask.mutate({ taskId, updates: { subtasks } });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="glass rounded-2xl p-12 text-center max-w-lg mx-auto">
        <p className="font-semibold text-lg">Task not found</p>
        <p className="text-muted-foreground text-sm mt-2">This task may have been deleted.</p>
        <Link href="/inbox" className="btn-primary mt-6 inline-flex">Back to Inbox</Link>
      </div>
    );
  }

  const isDone = task.status === 'completed';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/inbox" className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="page-title flex-1 truncate">{task.title}</h1>
        {!editing && (
          <button onClick={startEditing} className="btn-secondary text-sm">Edit</button>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-base resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input-base">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} className="input-base">
                {(['work', 'personal', 'study', 'finance', 'health', 'errands', 'other'] as TaskCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={updateTask.isPending} className="btn-primary">
                {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <button
                onClick={() => complete.mutate(taskId)}
                className="mt-1 hover:scale-110 transition-transform"
              >
                {isDone
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  : <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                }
              </button>
              <div className="flex-1">
                <h2 className={cn('text-xl font-semibold', isDone && 'line-through text-muted-foreground')}>
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{task.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={cn('badge', PRIORITY_COLORS[task.priority])}>{task.priority}</span>
              <span className="badge border-border">{CATEGORY_ICONS[task.category]} {task.category}</span>
              <span className="badge border-border">{task.effort as TaskEffort}</span>
              <span className="badge border-border">{formatDeadline(task.deadline)}</span>
            </div>
          </>
        )}

        {task.subtasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Subtasks</h3>
            <div className="space-y-2">
              {task.subtasks.map((s) => (
                <button
                  key={s.subtaskId}
                  onClick={() => toggleSubtask(s.subtaskId)}
                  className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {s.status === 'done'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  }
                  <span className={cn('text-sm', s.status === 'done' && 'line-through text-muted-foreground')}>
                    {s.title}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">{s.estimatedMinutes}m</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!editing && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <button
              onClick={() => snooze.mutate({ taskId, minutes: 30 })}
              className="btn-secondary text-sm"
            >
              <Timer className="w-4 h-4" /> Snooze 30m
            </button>
            <button
              onClick={() => {
                const now = new Date();
                blockCalendar.mutate({
                  taskId,
                  title: task.title,
                  start: now.toISOString(),
                  end: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
                });
              }}
              className="btn-secondary text-sm"
            >
              <Calendar className="w-4 h-4" /> Block 1h
            </button>
            <button
              onClick={() => {
                setCoachingTask(task.taskId, task.title, task.rescheduleCount || 0);
                openModal('procrastination-coach');
              }}
              className="btn-secondary text-sm"
            >
              <Brain className="w-4 h-4 text-violet-400" /> Coach Me
            </button>
            <button
              onClick={() => { if (confirm('Delete this task?')) del.mutate(taskId); }}
              className="btn-destructive text-sm ml-auto"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
