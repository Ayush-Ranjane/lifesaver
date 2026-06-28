import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Goals' };
import { GoalsPage } from '@/components/pages/GoalsPage';
export default function Goals() { return <GoalsPage />; }
