import type { Task, SubTask } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function breakTaskIntoSubtasks(task: Task): Promise<SubTask[]> {
  const thirdOfTime = Math.floor(task.estimatedMinutes / 3) || 10;
  
  return [
    {
      subtaskId: uuidv4(),
      title: "Review requirements and context",
      estimatedMinutes: thirdOfTime,
      order: 1,
      status: 'pending',
      completedAt: null,
    },
    {
      subtaskId: uuidv4(),
      title: "Draft initial work/solution",
      estimatedMinutes: thirdOfTime,
      order: 2,
      status: 'pending',
      completedAt: null,
    },
    {
      subtaskId: uuidv4(),
      title: "Finalize and review",
      estimatedMinutes: task.estimatedMinutes - (thirdOfTime * 2),
      order: 3,
      status: 'pending',
      completedAt: null,
    }
  ];
}
