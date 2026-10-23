import type { PublicUser, UserFormValues } from './userTypes';

export async function saveUser(editing: PublicUser | null, values: UserFormValues): Promise<void> {
  const payload: Record<string, string> = {
    email: values.email.trim(),
    role: values.role,
  };
  if (!editing || values.password.trim()) {
    payload.password = values.password;
  }
  const response = await fetch(editing ? `/api/admin/users/${editing.id}` : '/api/admin/users', {
    method: editing ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body.error === 'string' ? body.error : 'Failed to save user';
    throw new Error(message);
  }
}

export async function setUserStatus(id: string, status: 'ACTIVE' | 'DISABLED'): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body.error === 'string' ? body.error : 'Failed to update status';
    throw new Error(message);
  }
}
