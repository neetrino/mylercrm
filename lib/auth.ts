import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// Динамический импорт функции авторизации, чтобы bcryptjs не загружался в Edge Runtime
// authorizeUser использует bcryptjs, который работает только в Node.js runtime
let authorizeUser: ((email: string, password: string) => Promise<{ id: string; email: string; role: string } | null>) | null = null;

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Динамический импорт функции авторизации только когда она действительно нужна
        // Это предотвращает загрузку bcryptjs в Edge Runtime (middleware)
        // Файл authorize.ts использует bcryptjs, который работает только в Node.js runtime
        if (!authorizeUser) {
          const authModule = await import('./authorize');
          authorizeUser = authModule.authorizeUser;
        }

        return await authorizeUser(email, password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
      }
      if (trigger === 'update' && session?.user?.email) {
        token.email = session.user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        if (typeof token.email === 'string') session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
