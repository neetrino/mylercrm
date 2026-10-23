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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
        <div className="px-6 pb-2 pt-6">
          <h2 className="text-[16px] font-semibold text-gray-950">{user ? 'Edit user' : 'Add user'}</h2>
          <p className="mt-1 text-[13px] leading-5 text-gray-500">
            {user ? 'Leave the password blank to keep the current one.' : 'The same login works in the CRM and in 3D.'}
          </p>
        </div>
        <div className="px-6 py-4">
          {error ? <p className="mb-3 text-[13px] text-red-700">{error}</p> : null}
          <UserFormFields user={user} values={values} setValues={setValues} />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary h-9 rounded-lg px-3.5 text-[13px]">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary h-9 rounded-lg px-3.5 text-[13px]">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
