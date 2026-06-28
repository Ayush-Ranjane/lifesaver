'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase/client';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  BOTTOM_NAV,
  TEAM_NAV,
  WORKSPACE_NAV,
  TIER_BADGE_STYLES,
  isNavActive,
  type NavItem,
} from '@/lib/navigation';
import { Button } from '@/components/ui/button';

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex h-9 items-center gap-3 rounded-xl px-2.5 text-[13px] font-medium',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        active
          ? 'bg-[var(--pulse-subtle)] text-primary font-semibold shadow-[inset_0_1px_0_var(--glass-border-highlight)]'
          : 'text-text-secondary hover:bg-[var(--glass-mid)] hover:text-text-primary hover:translate-x-0.5'
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="active-nav-border"
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <item.icon
        className={cn(
          'h-[18px] w-[18px] flex-shrink-0',
          active ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary'
        )}
        strokeWidth={1.75}
      />

      <span className="flex-1 truncate">
        {item.label}
      </span>

      {item.badge && item.tier && (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            TIER_BADGE_STYLES[item.tier]
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
      {children}
    </p>
  );
}

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { setMobileNav } = useUIStore();
  const { userProfile, firebaseUser } = useAuthStore();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const closeMobile = () => setMobileNav(false);

  const sidebarContent = (
    <div className="flex h-full w-full flex-col">
      {/* Wordmark */}
      <div className="flex h-[52px] flex-shrink-0 items-center justify-between px-4 border-b border-[var(--glass-border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-gradient text-white text-[12px] font-bold shadow-apple-sm transition-transform duration-300 group-hover:scale-105">
            L
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-primary">
            LifeSaver
          </span>
        </Link>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={closeMobile} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-2 scrollbar-hide">
        <SectionLabel>Workspace</SectionLabel>
        <div className="space-y-0.5">
          {WORKSPACE_NAV.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={mobile ? closeMobile : undefined} />
          ))}
        </div>

        <SectionLabel>Team</SectionLabel>
        <div className="space-y-0.5">
          {TEAM_NAV.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={mobile ? closeMobile : undefined} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={mobile ? closeMobile : undefined} />
        ))}

        <button
          onClick={handleSignOut}
          className="group flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-medium text-accent-red/70 transition-colors duration-120 hover:bg-accent-red/[0.06] hover:text-accent-red"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 rounded-md p-2 mt-1">
          {firebaseUser?.photoURL ? (
            <Image
              src={firebaseUser.photoURL}
              alt="Avatar"
              width={28}
              height={28}
              className="h-7 w-7 flex-shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              {(userProfile?.displayName || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-primary">
              {userProfile?.displayName ?? 'User'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <aside className="flex h-full w-[260px] flex-col apple-glass-strong z-50 shadow-apple-xl">
        {sidebarContent}
      </aside>
    );
  }

  return (
    <aside
      className="fixed left-0 top-0 z-50 hidden h-screen w-[240px] flex-col apple-glass-strong lg:flex shadow-apple-lg border-r border-[var(--glass-border)]"
    >
      {sidebarContent}
    </aside>
  );
}
