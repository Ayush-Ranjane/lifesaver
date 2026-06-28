'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { ProcrastinationCoachModal } from '@/components/ProcrastinationCoachModal';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isMobileNavOpen, setMobileNav, activeModal } = useUIStore();

  return (
    <div className="relative min-h-screen bg-void bg-hero-glow">
      <Sidebar />

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md lg:hidden"
              onClick={() => setMobileNav(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TopBar />

      <main className="min-h-screen pt-[76px] px-6 lg:pl-[calc(240px+32px)] lg:pr-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>

      {activeModal === 'task-create' && <TaskCreateModal />}
      {activeModal === 'procrastination-coach' && <ProcrastinationCoachModal />}
    </div>
  );
}
