'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Settings,
} from 'lucide-react';

export type SidebarNavItem = {
  href: string;
  label: string;
  iconName: string;
};

type SidebarNavProps = {
  navItems: SidebarNavItem[];
  onNavigate?: () => void;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Settings,
};

export default function SidebarNav({ navItems, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {navItems.map((item) => {
        const Icon = iconMap[item.iconName];
        if (!Icon) return null;

        const isActive = pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <div key={item.href}>
          {item.iconName === 'Settings' ? <div className="mx-2 my-3 border-t border-white/10" /> : null}
          <Link
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-yellow-300" />
            )}
            <Icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-yellow-300' : 'text-white/45 group-hover:text-white/80'
              }`}
            />
            <span>{item.label}</span>
          </Link>
          </div>
        );
      })}
    </nav>
  );
}
