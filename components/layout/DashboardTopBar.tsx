'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { BRAND_LOGO_URL } from './brandLogo';

type DashboardTopBarProps = {
  onOpen: () => void;
};

export function DashboardTopBar({ onOpen }: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <Image
        src={BRAND_LOGO_URL}
        alt="Myler"
        width={120}
        height={40}
        className="h-8 w-auto object-contain object-left"
        priority
        unoptimized
      />
    </header>
  );
}
