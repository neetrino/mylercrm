'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import type { SidebarNavItem } from './SidebarNav';
import { useCloseOnEscape } from '@/components/ui/useCloseOnEscape';

const DESKTOP_NAV_MIN_PX = 1024;

type DashboardShellProps = {
  navItems: SidebarNavItem[];
  children: ReactNode;
};

export function DashboardShell({ navItems, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav(pathname);

  return (
    <div className="min-h-screen">
      <DashboardTopBar onOpen={() => setOpen(true)} />
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-blue-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <DashboardSidebar navItems={navItems} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 lg:pl-64">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function useMobileNav(pathname: string) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useCloseOnEscape(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_MIN_PX) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [open]);

  return { open, setOpen };
}
