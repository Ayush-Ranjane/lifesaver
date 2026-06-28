import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Calendar' };
import { CalendarViewPage } from '@/components/pages/CalendarViewPage';
export default function CalendarPage() { return <CalendarViewPage />; }
