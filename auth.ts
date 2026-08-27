import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prismaAdapter } from '@/lib/auth/prisma-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: prismaAdapter(),
	providers: [Google],
	session: { strategy: 'database' },
	pages: { signIn: '/signin' },
});
