import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Analytics' };
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
export default function Analytics() { return <AnalyticsPage />; }
