import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Notifications' };
import { NotificationsPage } from '@/components/pages/NotificationsPage';
export default function Notifications() { return <NotificationsPage />; }
