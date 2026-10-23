'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { BRAND_LOGO_URL } from './brandLogo';

type DashboardTopBarProps = {
  onOpen: () => void;
};

export function DashboardTopBar({ onOpen }: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-blue-950 text-white lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <div className="rounded-xl bg-white px-2 py-1">
          <Image
            src={BRAND_LOGO_URL}
            alt="Myler"
            width={120}
            height={40}
            className="h-8 w-auto object-contain object-left"
            priority
            unoptimized
          />
        </div>
      </div>
    </header>
  );
}
