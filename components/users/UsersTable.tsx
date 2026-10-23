'use client';

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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No users yet</td>
            </tr>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                onEdit={onEdit}
                onStatus={() => changeStatus(user)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  onEdit,
  onStatus,
}: {
  user: PublicUser;
  isSelf: boolean;
  onEdit: (user: PublicUser) => void;
  onStatus: () => void;
}) {
  const statusClass = user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600';
  return (
    <tr>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{user.role}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>{user.status}</span>
      </td>
      <td className="px-6 py-4 text-right text-sm">
        <button type="button" onClick={() => onEdit(user)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
        <button
          type="button"
          onClick={onStatus}
          disabled={isSelf && user.status === 'ACTIVE'}
          className="text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  );
}
