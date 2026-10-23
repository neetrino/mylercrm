import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'ADMIN';
  const navItems = [
    { href: '/apartments', label: 'Apartments', iconName: 'Home' },
    ...(isAdmin
      ? [
          { href: '/admin/buildings', label: 'Buildings', iconName: 'Building2' },
          { href: '/admin/districts', label: 'Districts', iconName: 'MapPin' },
          { href: '/admin/users', label: 'Users', iconName: 'Users' },
        ]
      : []),
    { href: '/dashboard', label: 'Analytics', iconName: 'LayoutDashboard' },
    { href: '/settings', label: 'Settings', iconName: 'Settings' },
  ];

  return (
    <DashboardShell navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
