'use client';

import { useState } from 'react';
import { UserForm } from './UserForm';
import { UsersLoading } from './UsersLoading';
import { UsersTable } from './UsersTable';
import { UsersToolbar } from './UsersToolbar';
import { useUsersQuery } from './useUsersQuery';
import type { PublicUser } from './userTypes';

type UsersListProps = {
  currentUserId: string;
};

export function UsersList({ currentUserId }: UsersListProps) {
  const { users, loading, error, reload } = useUsersQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PublicUser | null>(null);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    void reload();
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <UsersToolbar onAdd={openCreate} />
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</p> : null}
      {loading ? <UsersLoading /> : (
          <UsersTable
            users={users}
            currentUserId={currentUserId}
            onEdit={(user) => {
              setEditing(user);
              setShowForm(true);
            }}
            onChanged={() => void reload()}
          />
      )}
      {showForm ? <UserForm user={editing} onClose={closeForm} onSaved={closeForm} /> : null}
    </div>
  );
}
