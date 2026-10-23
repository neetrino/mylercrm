'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const PASSWORD_MIN_LENGTH = 8;

type SettingsFormProps = {
  email: string;
};

type AccountPayload = {
  email: string;
  currentPassword: string;
  newPassword?: string;
};

export function SettingsForm({ email }: SettingsFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [login, setLogin] = useState(email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    void submitSettings(event, {
      login, currentPassword, newPassword, confirmPassword, update, router,
      setError, setSaved, setLoading, setCurrentPassword, setNewPassword, setConfirmPassword,
    });
  };

  return (
    <AccountCard
      login={login}
      currentPassword={currentPassword}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      error={error}
      saved={saved}
      loading={loading}
      onLogin={setLogin}
      onCurrentPassword={setCurrentPassword}
      onNewPassword={setNewPassword}
      onConfirmPassword={setConfirmPassword}
      onSubmit={onSubmit}
    />
  );
}

function AccountCard(props: {
  login: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  saved: boolean;
  loading: boolean;
  onLogin: (value: string) => void;
  onCurrentPassword: (value: string) => void;
  onNewPassword: (value: string) => void;
  onConfirmPassword: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="card max-w-lg p-6 sm:p-8">
      <Field id="login" label="Login" type="email" value={props.login} onChange={props.onLogin} autoComplete="username" />
      <Field id="current-password" label="Current password" type="password" value={props.currentPassword} onChange={props.onCurrentPassword} autoComplete="current-password" />
      <Field id="new-password" label="New password" type="password" value={props.newPassword} onChange={props.onNewPassword} autoComplete="new-password" optional />
      <Field id="confirm-password" label="Confirm new password" type="password" value={props.confirmPassword} onChange={props.onConfirmPassword} autoComplete="new-password" optional />
      {props.error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{props.error}</p> : null}
      {props.saved ? <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Saved.</p> : null}
      <button type="submit" disabled={props.loading} className="btn-primary">
        {props.loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

type SubmitState = {
  login: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  update: (data: { user: { email: string } }) => Promise<unknown>;
  router: { refresh: () => void };
  setError: (value: string) => void;
  setSaved: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
};

async function submitSettings(event: React.FormEvent, state: SubmitState) {
  event.preventDefault();
  const mismatch = passwordError(state.newPassword, state.confirmPassword);
  state.setError(mismatch);
  state.setSaved(false);
  if (mismatch) return;
  state.setLoading(true);
  try {
    const nextEmail = await saveAccount({
      email: state.login,
      currentPassword: state.currentPassword,
      newPassword: state.newPassword || undefined,
    });
    await state.update({ user: { email: nextEmail } });
    state.setCurrentPassword('');
    state.setNewPassword('');
    state.setConfirmPassword('');
    state.setSaved(true);
    state.router.refresh();
  } catch (err) {
    state.setError(err instanceof Error ? err.message : 'Could not save');
  } finally {
    state.setLoading(false);
  }
}

function passwordError(next: string, confirm: string): string {
  if (next !== confirm) return 'New password and confirmation do not match';
  if (next && next.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  return '';
}

async function saveAccount(payload: AccountPayload): Promise<string> {
  const response = await fetch('/api/account', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string; email?: string };
  if (!response.ok || !body.email) throw new Error(body.error ?? 'Could not save');
  return body.email;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  optional,
}: {
  id: string;
  label: string;
  type: 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={id} className="mb-4 block text-sm font-medium text-gray-700">
      {label}
      <input
        id={id}
        type={type}
        required={!optional}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="input-field mt-1.5"
      />
    </label>
  );
}
