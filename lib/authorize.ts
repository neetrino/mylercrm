import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const EMAIL_MAX_LENGTH = 320;
const PASSWORD_MAX_LENGTH = 128;
/** Valid bcrypt hash used only so unknown emails take the same time as a real compare. */
const DUMMY_PASSWORD_HASH = '$2b$10$4QgvnWpvidcFuMOj3G2P6.xB9Sw7c4dzuRkIqpzwvlG57cb5wEuS.';

/**
 * Функция авторизации пользователя
 * Вынесена в отдельный файл, чтобы изолировать bcryptjs от Edge Runtime
 * Этот файл используется только в Node.js runtime (API routes)
 */
export async function authorizeUser(
  email: string,
  password: string
): Promise<{ id: string; email: string; role: string } | null> {
  if (!email || !password || email.length > EMAIL_MAX_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const isPasswordValid = await bcrypt.compare(password, hash);

  if (!user || !isPasswordValid || user.status !== 'ACTIVE') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
