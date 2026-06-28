import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Dashboard' };

import { DashboardPage } from '@/components/pages/DashboardPage';
export default function Dashboard() { return <DashboardPage />; }
