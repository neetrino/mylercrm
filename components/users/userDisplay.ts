import type { PublicUser } from './userTypes';

const INITIALS_SPLIT = /[._-]/;

export function userInitials(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(INITIALS_SPLIT).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function roleLabel(role: PublicUser['role']): string {
  return role === 'ADMIN' ? 'Admin' : 'Sales';
}

export function userCounts(users: PublicUser[]): { total: number; active: number; admins: number } {
  return {
    total: users.length,
    active: users.filter((user) => user.status === 'ACTIVE').length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
  };
}
