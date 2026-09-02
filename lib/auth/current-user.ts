import { cache } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const getCurrentUser = cache(async () => {
	const session = await auth();
	if (!session?.user?.id) return null;

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			email: true,
			fullName: true,
			avatarUrl: true,
			roles: true,
		},
	});

	if (!user) return null;

	return {
		id: user.id,
		email: user.email,
		name: user.fullName,
		image: user.avatarUrl,
		roles: user.roles,
	};
});

export async function getCurrentUserId(): Promise<string> {
	const user = await getCurrentUser();

	if (!user?.id) throw new Error('Not authenticated');

	return user.id;
}
