import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/appError';
import { prisma } from '@/lib/prisma';

const BCRYPT_ROUNDS = 10;

type AccountInput = {
  email: string;
  currentPassword: string;
  newPassword?: string;
};

function prismaCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: string }).code);
  }
  return '';
}

async function assertCurrentPassword(userId: string, currentPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('Unauthorized', 401);
  }
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw new AppError('Current password is incorrect', 400);
  return user;
}

function accountChanges(userEmail: string, input: AccountInput): Prisma.UserUpdateInput {
  const email = input.email.trim().toLowerCase();
  const data: Prisma.UserUpdateInput = {};
  if (email !== userEmail) data.email = email;
  return data;
}

/**
 * Updates the signed-in user's login (email) and, when provided, password.
 * The current password must match before either change is stored.
 */
export async function updateOwnAccount(userId: string, input: AccountInput): Promise<{ email: string }> {
  const user = await assertCurrentPassword(userId, input.currentPassword);
  const data = accountChanges(user.email, input);
  if (input.newPassword) {
    data.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  }
  if (Object.keys(data).length === 0) {
    throw new AppError('Enter a new login or password', 400);
  }
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { email: true },
    });
    return { email: updated.email };
  } catch (error) {
    if (prismaCode(error) === 'P2002') throw new AppError('This login is already in use', 409);
    throw error;
  }
}
