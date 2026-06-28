'use client';

import { Layout } from './Layout';

/** @deprecated Use Layout instead */
export function AppShell({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
