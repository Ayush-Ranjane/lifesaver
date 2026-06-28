import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Habits' };
import { HabitsPage } from '@/components/pages/HabitsPage';
export default function Habits() { return <HabitsPage />; }
