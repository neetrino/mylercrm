'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import type { SidebarNavItem } from './SidebarNav';

const DESKTOP_NAV_MIN_PX = 1024;

type DashboardShellProps = {
  navItems: SidebarNavItem[];
  email: string;
  role: string;
  children: ReactNode;
};

export function DashboardShell({ navItems, email, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTopBar onOpen={() => setOpen(true)} />
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <DashboardSidebar
        navItems={navItems}
        email={email}
        role={role}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="min-w-0 lg:pl-64">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function useMobileNav(pathname: string) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_MIN_PX) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [open]);

  return { open, setOpen };
}
