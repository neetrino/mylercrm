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

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Directory</h2>
        <p className="mt-0.5 text-xs text-gray-500">{users.length === 0 ? 'No accounts yet' : `${users.length} people can sign in`}</p>
      </div>
      {users.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-gray-500">Add the first user to give someone access.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              onEdit={onEdit}
              onStatus={() => changeStatus(user)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
