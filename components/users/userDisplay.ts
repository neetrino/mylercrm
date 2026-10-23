import type { PublicUser } from './userTypes';

export function roleLabel(role: PublicUser['role']): string {
  return role === 'ADMIN' ? 'Admin' : 'Sales';
}
