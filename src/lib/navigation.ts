import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Target,
  Flame,
  BarChart3,
  Zap,
  Bot,
  Users,
  Bell,
  Settings,
} from 'lucide-react';

export type NavTier = 'free' | 'pro' | 'power';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  tier?: NavTier;
  badge?: string;
}

export const WORKSPACE_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Habits', href: '/habits', icon: Flame },
  { label: 'Goals', href: '/goals', icon: Target, tier: 'pro', badge: 'Pro' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, tier: 'pro', badge: 'Pro' },
  { label: 'Focus Mode', href: '/focus', icon: Zap, tier: 'power', badge: 'Power' },
  { label: 'AI Coach', href: '/agent', icon: Bot, tier: 'power', badge: 'Power' },
];

export const TEAM_NAV: NavItem[] = [
  { label: 'Pods', href: '/pods', icon: Users },
  { label: 'Team', href: '/team', icon: Users, tier: 'power', badge: 'Power' },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/calendar': 'Calendar',
  '/habits': 'Habits',
  '/goals': 'Goals',
  '/analytics': 'Analytics',
  '/focus': 'Focus Mode',
  '/agent': 'AI Coach',
  '/pods': 'Pods',
  '/team': 'Team',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/audit': 'Weekly Audit',
};

export function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(`${path}/`)) return title;
  }

  return 'LifeSaver';
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const TIER_BADGE_STYLES: Record<NavTier, string> = {
  free: '',
  pro: 'bg-indigo-500/20 text-indigo-400',
  power: 'bg-warning/15 text-warning',
};
