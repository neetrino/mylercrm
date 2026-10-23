'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { PublicUser, UserFormValues } from './userTypes';

type UserFormFieldsProps = {
  user: PublicUser | null;
  values: UserFormValues;
  setValues: Dispatch<SetStateAction<UserFormValues>>;
};

export function UserFormFields({ user, values, setValues }: UserFormFieldsProps) {
  return (
    <>
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
      <input
        type="email"
        required
        value={values.email}
        onChange={(event) => setValues({ ...values, email: event.target.value })}
        className="input-field mb-3"
        placeholder="name@company.com"
      />
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
        {user ? 'New password' : 'Password'}
      </label>
      <input
        type="password"
        required={!user}
        minLength={user ? undefined : 8}
        value={values.password}
        onChange={(event) => setValues({ ...values, password: event.target.value })}
        className="input-field mb-3"
        placeholder={user ? 'Leave blank to keep current' : 'At least 8 characters'}
      />
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Role</label>
      <select
        value={values.role}
        onChange={(event) => setValues({ ...values, role: event.target.value as UserFormValues['role'] })}
        className="input-field mb-4"
      >
        <option value="SALES">Sales</option>
        <option value="ADMIN">Admin</option>
      </select>
    </>
  );
}
