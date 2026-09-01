import { auth } from '@/auth';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
	const session = await auth();
	return session?.user ?? null;
});

export async function getCurrentUserId(): Promise<string> {
	const user = await getCurrentUser();

	if (!user?.id) throw new Error('Not authenticated');

	return user.id;
}
