'use client';

import { useGitHubSync, useGitHubImportStore, GitHubIssue } from '@/hooks/useGitHubIntegration';
import { useCreateTask } from '@/hooks/useTasks';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Plus } from 'lucide-react';

const Github = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3.6-.45 7-1.8 7-7.76a5.76 5.76 0 0 0-1.5-3.78 5.4 5.4 0 0 0-.15-3.82s-1.18-.35-3.9 1.48a13.38 13.38 0 0 0-7 0c-2.72-1.83-3.9-1.48-3.9-1.48a5.4 5.4 0 0 0-.15 3.82A5.76 5.76 0 0 0 3 13.24c0 5.96 3.4 7.31 7 7.76a4.8 4.8 0 0 0-1 3.24v4" />
  </svg>
);
import { toast } from 'sonner';

export function GitHubImportPanel() {
  const { isOpen, closePanel } = useGitHubImportStore();
  const { data: issues, isFetching, refetch } = useGitHubSync();
  const createTask = useCreateTask();

  if (!isOpen) return null;

  const handleImport = (issue: GitHubIssue) => {
    createTask.mutate({
      title: `[${issue.repo}#${issue.number}] ${issue.title}`,
      source: 'github',
    });
    toast.success('Issue imported to tasks!');
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
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold">GitHub Import</h2>
              <p className="text-xs text-muted-foreground">Import assigned issues</p>
            </div>
          </div>
          <button onClick={closePanel} className="btn-ghost p-2 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary w-full flex justify-center items-center gap-2"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            {isFetching ? 'Syncing...' : 'Sync Issues'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {issues?.map((issue) => (
            <div key={issue.id} className="glass rounded-2xl p-4 border border-border group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {issue.repo}
                </span>
                <span className="text-xs text-muted-foreground">#{issue.number}</span>
              </div>
              <p className="font-medium text-sm mb-4 leading-tight">{issue.title}</p>
              
              <div className="flex justify-end">
                <button onClick={() => handleImport(issue)} className="btn-primary py-1 px-3 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Import Task
                </button>
              </div>
            </div>
          ))}

          {!isFetching && issues?.length === 0 && (
            <div className="text-center py-12">
              <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-bold text-muted-foreground">No assigned issues</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
