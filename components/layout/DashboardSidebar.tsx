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
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${panel}`}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <Image
          src={BRAND_LOGO_URL}
          alt="Myler"
          width={160}
          height={56}
          className="h-10 w-auto object-contain object-left"
          priority
          unoptimized
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <SidebarNav navItems={navItems} onNavigate={onClose} />
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-500">Logged in as</p>
          <p className="break-all text-sm font-semibold text-gray-900">{email}</p>
          <p className="text-xs capitalize text-gray-500">{role.toLowerCase()}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
