import type { Metadata } from 'next';
import { TaskDetailPage } from '@/components/pages/TaskDetailPage';

export const metadata: Metadata = { title: 'Task' };

export default function TaskDetail({ params }: { params: Promise<{ taskId: string }> }) {
  return <TaskDetailPage params={params} />;
}
