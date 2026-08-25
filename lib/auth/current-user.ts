import { prisma } from '@/lib/prisma';
import { STUB_CURRENT_USER_EMAIL } from '@/lib/auth/stub-user';

// TODO: Replace this development stub with the authenticated session user as
// soon as Auth.js is in place. Every authorization check depends on this boundary.
export async function getCurrentUserId(): Promise<string> {
	const user = await prisma.user.findFirstOrThrow({
		where: { email: STUB_CURRENT_USER_EMAIL },
		select: { id: true },
	});

	return user.id;
}
