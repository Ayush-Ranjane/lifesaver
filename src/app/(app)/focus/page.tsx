import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Focus Mode' };
import { Suspense } from 'react';
import { FocusPage } from '@/components/pages/FocusPage';

export default function Focus() {
  return (
    <Suspense
      fallback={
        <div className="-mx-4 flex min-h-[calc(100vh-var(--topbar-height)-2rem)] items-center justify-center sm:-mx-6 lg:-mx-8">
          <div className="skeleton h-[360px] w-[360px] rounded-full" />
        </div>
      }
    >
      <FocusPage />
    </Suspense>
  );
}
