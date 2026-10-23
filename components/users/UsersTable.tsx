'use client';

import { UserRow } from './UserRow';
import { setUserStatus } from './userFormApi';
import type { PublicUser } from './userTypes';

type UsersTableProps = {
  users: PublicUser[];
  currentUserId: string;
  onEdit: (user: PublicUser) => void;
  onChanged: () => void;
};

const HEAD = 'px-4 py-2.5 text-left text-[12px] font-medium text-gray-400';

export function UsersTable({ users, currentUserId, onEdit, onChanged }: UsersTableProps) {
  const changeStatus = async (user: PublicUser) => {
    const next = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const label = next === 'DISABLED' ? 'disable' : 'enable';
    if (!confirm(`Are you sure you want to ${label} ${user.email}?`)) return;
    try {
      await setUserStatus(user.id, next);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-16 text-center text-[14px] text-gray-500">
        No users yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className={HEAD}>Email</th>
            <th className={HEAD}>Role</th>
            <th className={HEAD}>Status</th>
            <th className={`${HEAD} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              onEdit={onEdit}
              onStatus={() => changeStatus(user)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
