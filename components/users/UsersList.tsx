'use client';

import { useState } from 'react';
import { UserForm } from './UserForm';
import { UsersTable } from './UsersTable';
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

  if (loading) return <div className="py-8 text-center">Loading...</div>;

  return (
    <div>
      {error ? <p className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add user
        </button>
      </div>
      {showForm ? <UserForm user={editing} onClose={closeForm} onSaved={closeForm} /> : null}
      <UsersTable
        users={users}
        currentUserId={currentUserId}
        onEdit={(user) => {
          setEditing(user);
          setShowForm(true);
        }}
        onChanged={() => void reload()}
      />
    </div>
  );
}
