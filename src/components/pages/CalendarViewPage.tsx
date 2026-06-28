'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false, loading: () => <div className="skeleton h-[600px] rounded-2xl w-full" /> });
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useTaskList, useUpdateTask } from '@/hooks/useTasks';
import { useUIStore } from '@/store/uiStore';
import { Calendar } from 'lucide-react';
import type { Task } from '@/types';

const PRIORITY_EVENT_COLORS: Record<Task['priority'], string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#6b7280',
};

export function CalendarViewPage() {
  const { data: tasks = [], isLoading } = useTaskList();
  const updateTask = useUpdateTask();
  const { openModal } = useUIStore();

  // Map tasks to FullCalendar events
  const events = useMemo(() =>
    tasks
      .filter(t => !t.isArchived && t.status !== 'cancelled')
      .map(task => ({
        id: task.taskId,
        title: task.title,
        start: task.scheduledStart ?? task.deadline,
        end: task.deadline,
        allDay: false,
        backgroundColor: PRIORITY_EVENT_COLORS[task.priority],
        borderColor: PRIORITY_EVENT_COLORS[task.priority],
        extendedProps: { task },
        classNames: task.status === 'completed' ? ['opacity-40 line-through'] : [],
      })),
    [tasks]
  );

  const handleEventDrop = ({ event, revert }: { event: { id: string; start: Date | null }; revert: () => void }) => {
    if (!event.start) return;
    updateTask.mutate(
      { taskId: event.id, updates: { deadline: event.start } },
      { onError: revert }
    );
  };

  const handleDateClick = () => {
    openModal('task-create');
  };

  if (isLoading) return (
    <div className="skeleton h-[600px] rounded-2xl" />
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" /> Calendar
      </h1>

      <div className="glass rounded-2xl p-4 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={events}
          editable={true}
          selectable={true}
          eventDrop={handleEventDrop}
          dateClick={handleDateClick}
          height="auto"
          eventClick={({ event }) => {
            window.location.href = `/tasks/${event.id}`;
          }}
          eventContent={(eventInfo) => (
            <div className="px-1 py-0.5 truncate text-xs font-medium text-white">
              {eventInfo.event.title}
            </div>
          )}
        />
      </div>
    </div>
  );
}
