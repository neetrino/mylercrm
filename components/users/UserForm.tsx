'use client';

import { useState } from 'react';
import { saveUser } from './userFormApi';
import { UserFormFields } from './UserFormFields';
import type { PublicUser, UserFormValues } from './userTypes';

type UserFormProps = {
  user: PublicUser | null;
  onClose: () => void;
  onSaved: () => void;
};

export function UserForm({ user, onClose, onSaved }: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>({
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'SALES',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveUser(user, values);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{user ? 'Edit user' : 'Add user'}</h2>
        {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
        <UserFormFields user={user} values={values} setValues={setValues} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
