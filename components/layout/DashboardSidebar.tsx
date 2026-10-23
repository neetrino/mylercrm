'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import LogoutButton from './LogoutButton';
import SidebarNav, { type SidebarNavItem } from './SidebarNav';
import { BRAND_LOGO_URL } from './brandLogo';

type DashboardSidebarProps = {
  navItems: SidebarNavItem[];
  email: string;
  role: string;
  open: boolean;
  onClose: () => void;
};

export function DashboardSidebar({ navItems, email, role, open, onClose }: DashboardSidebarProps) {
  const panel = open ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-blue-950 text-white shadow-card transition-transform duration-200 lg:translate-x-0 ${panel}`}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
          <Image
            src={BRAND_LOGO_URL}
            alt="Myler"
            width={160}
            height={56}
            className="h-10 w-auto object-contain object-left"
            priority
            unoptimized
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
        Workspace
      </p>
      <SidebarNav navItems={navItems} onNavigate={onClose} />
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Signed in</p>
          <p className="mt-1 break-all text-sm font-semibold text-white">{email}</p>
          <p className="mt-0.5 text-xs capitalize text-yellow-300">{role.toLowerCase()}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
