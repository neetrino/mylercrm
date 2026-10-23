import { Prisma } from '@prisma/client';
import type { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '@/lib/appError';
import { prisma } from '@/lib/prisma';

const BCRYPT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

function prismaCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: string }).code);
  }
  return '';
}

export async function listUsers(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: 'asc' },
  });
  return users.map(toPublicUser);
}

export async function createUser(input: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  try {
    const user = await prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        passwordHash,
        role: input.role,
        status: 'ACTIVE',
      },
      select: userSelect,
    });
    return toPublicUser(user);
  } catch (error) {
    if (prismaCode(error) === 'P2002') {
      throw new AppError('User with this email already exists', 409);
    }
    throw error;
  }
}

export async function updateUser(
  id: string,
  actorId: string,
  input: { email?: string; password?: string; role?: UserRole; status?: UserStatus },
): Promise<PublicUser> {
  if (input.status === 'DISABLED' && id === actorId) {
    throw new AppError('You cannot disable your own account', 400);
  }
  const data: Prisma.UserUpdateInput = {};
  if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
  if (input.role !== undefined) data.role = input.role;
  if (input.status !== undefined) data.status = input.status;
  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }
  try {
    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    return toPublicUser(user);
  } catch (error) {
    if (prismaCode(error) === 'P2002') {
      throw new AppError('User with this email already exists', 409);
    }
    if (prismaCode(error) === 'P2025') {
      throw new AppError('User not found', 404);
    }
    throw error;
  }
}
