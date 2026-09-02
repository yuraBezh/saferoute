import { redirect } from 'next/navigation';
import { UserRole } from '@/generated/prisma/enums';
import { hasRole } from '@/lib/auth/roles';

export default async function Home() {
	if (await hasRole(UserRole.PARENT)) redirect('/children');
	redirect('/caregiver');
}
