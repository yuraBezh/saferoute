import type { UserRole } from '@/generated/prisma/enums';
import { getCurrentUser } from '@/lib/auth/current-user';

export async function hasRole(role: UserRole): Promise<boolean> {
	const user = await getCurrentUser();
	return user?.roles.includes(role) ?? false;
}

export async function requireRole(role: UserRole): Promise<void> {
	if (!(await hasRole(role))) {
		throw new Error('Forbidden');
	}
}
