'use client';

import { useInboxReviewStore } from '@/store/inboxReviewStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, Plus } from 'lucide-react';
import { useCreateTask } from '@/hooks/useTasks';
import type { ExtractedTask } from '@/hooks/useGmailIntegration';

export function InboxReviewPanel() {
  const { isOpen, scannedTasks, closeReview, removeTask } = useInboxReviewStore();
  const createTask = useCreateTask();

  if (!isOpen) return null;

  const handleApprove = (task: ExtractedTask) => {
    createTask.mutate({
      title: task.title,
      priority: task.suggestedPriority,
      source: 'email',
    });
    removeTask(task.sourceEmailId);
    
    if (scannedTasks.length <= 1) {
      closeReview();
    }
  };

  const handleReject = (emailId: string) => {
    removeTask(emailId);
    if (scannedTasks.length <= 1) {
      closeReview();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        className="fixed top-0 right-0 h-full w-[400px] glass border-l border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-bold">Inbox Review</h2>
              <p className="text-xs text-muted-foreground">{scannedTasks.length} tasks found by AI</p>
            </div>
          </div>
          <button onClick={closeReview} className="btn-ghost p-2 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {scannedTasks.map((task) => (
            <div key={task.sourceEmailId} className="glass rounded-2xl p-4 border border-border group">
              <p className="font-medium text-sm mb-3">{task.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Confidence: {Math.round(task.confidence * 100)}%
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleReject(task.sourceEmailId)} className="btn-ghost p-1.5 text-muted-foreground hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleApprove(task)} className="btn-primary py-1 px-3 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Task
                  </button>
                </div>
              </div>
            </div>
          ))}

          {scannedTasks.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="font-bold">Inbox Zero</p>
              <p className="text-sm text-muted-foreground">No pending tasks found in email.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
