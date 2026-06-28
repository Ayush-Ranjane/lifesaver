import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Team Workspace' };
import { Users, Lock } from 'lucide-react';
export default function TeamPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center animate-fade-in">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 shadow-apple-md">
          <Users className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Team Workspace</h1>
        <p className="text-text-secondary max-w-sm mx-auto mt-3">
          Collaborate with your team. Assign tasks, track blockers, and see per-member completion rates in a shared Kanban board.
        </p>
        <div className="mt-6 glass rounded-2xl p-5 flex items-center gap-3 text-sm text-amber-400 border-amber-500/20 hover-lift">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <span>Available on the <strong>Power</strong> tier — coming soon</span>
        </div>
      </div>
    </div>
  );
}
