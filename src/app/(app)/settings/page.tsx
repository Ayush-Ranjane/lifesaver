import type { Metadata } from 'next';
import { Suspense } from 'react';
export const metadata: Metadata = { title: 'Settings' };
import { SettingsPage } from '@/components/pages/SettingsPage';
export default function Settings() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-2xl max-w-3xl" />}>
      <SettingsPage />
    </Suspense>
  );
}
