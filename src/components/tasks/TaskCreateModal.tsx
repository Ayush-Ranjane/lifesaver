'use client';
import { useState } from 'react';
import { X, Calendar, Tag, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateTask } from '@/hooks/useTasks';
import type { CreateTaskInput, TaskPriority, TaskCategory, TaskEffort } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const EFFORT_LABELS: Record<TaskEffort, string> = {
  quick: '⚡ Quick (<15m)',
  short: '⏱ Short (<1h)',
  deep:  '🧠 Deep (>1h)',
};

export function TaskCreateModal() {
  const { closeModal } = useUIStore();
  const createTask = useCreateTask();
  void EFFORT_LABELS;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [effort, setEffort] = useState<TaskEffort>('short');
  const [deadline, setDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSave = async () => {
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      effort,
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    } as CreateTaskInput);
    
    closeModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === 'Escape') closeModal();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-2xl glass-card shadow-apple-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">New Task</h2>
            <button onClick={closeModal} className="btn-ghost p-1.5 rounded-md hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Task Title *</label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Submit quarterly report"
                className="input-base w-full text-base py-3"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className="input-base w-full resize-none text-sm"
              />
            </div>

            {/* Quick selectors */}
            <div className="flex flex-wrap gap-4 pt-2">
              
              {/* Priority */}
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="input-base w-full py-2 px-3 text-sm"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="input-base w-full py-2 px-3 text-sm"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="study">Study</option>
                  <option value="finance">Finance</option>
                  <option value="health">Health</option>
                  <option value="errands">Errands</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Effort */}
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Effort</label>
                <select 
                  value={effort} 
                  onChange={(e) => setEffort(e.target.value as TaskEffort)}
                  className="input-base w-full py-2 px-3 text-sm"
                >
                  <option value="quick">⚡ Quick (&lt;15m)</option>
                  <option value="short">⏱ Short (&lt;1h)</option>
                  <option value="deep">🧠 Deep (&gt;1h)</option>
                </select>
              </div>
            </div>

            {/* Deadline & Tags */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">Deadline</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="input-base w-full pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. urgent, frontend"
                    className="input-base w-full pl-9 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-secondary/30 mt-auto">
            <p className="text-xs text-muted-foreground">
              <kbd className="bg-border px-1.5 py-0.5 rounded text-[10px]">⌘↵</kbd> to save
            </p>
            <div className="flex gap-2">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || createTask.isPending}
                className="btn-primary"
              >
                {createTask.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
