import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Inbox' };
import { InboxPage } from '@/components/pages/InboxPage';
export default function Inbox() { return <InboxPage />; }
