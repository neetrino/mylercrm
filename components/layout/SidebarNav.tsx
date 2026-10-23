'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  iconName: string; // Строковый идентификатор иконки
};

type SidebarNavProps = {
  navItems: NavItem[];
};

// Маппинг иконок
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
};

export default function SidebarNav({ navItems }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = iconMap[item.iconName];
        if (!Icon) return null;
        
        const isActive = pathname === item.href || 
          (item.href !== '/dashboard' && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
            )}
            <Icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
