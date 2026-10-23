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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{user ? 'Edit user' : 'Add user'}</h2>
        <p className="mb-5 mt-1 text-sm text-gray-500">
          {user ? 'Update the account. Leave the password blank to keep it.' : 'This login works in the CRM and in 3D.'}
        </p>
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
