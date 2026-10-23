import { Shield, UserCheck, Users } from 'lucide-react';
import { userCounts } from './userDisplay';
import type { PublicUser } from './userTypes';

type UserStatsProps = {
  users: PublicUser[];
};

const STATS = [
  { key: 'total', label: 'Accounts', icon: Users, iconClass: 'bg-blue-50 text-blue-600' },
  { key: 'active', label: 'Active', icon: UserCheck, iconClass: 'bg-emerald-50 text-emerald-600' },
  { key: 'admins', label: 'Admins', icon: Shield, iconClass: 'bg-indigo-50 text-indigo-600' },
] as const;

export function UserStats({ users }: UserStatsProps) {
  const counts = userCounts(users);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key} className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-900">{counts[stat.key]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
