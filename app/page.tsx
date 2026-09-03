import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { LandingPage } from '@/components/landing-page';
import { UserRole } from '@/generated/prisma/enums';
import { getCurrentUser } from '@/lib/auth/current-user';
import { landingText } from '@/lib/content/landing-text';

export const metadata: Metadata = landingText.metadata;

export async function findCaregiverAction() {
	'use server';
	await signIn('google', { redirectTo: '/children' });
}

export async function becomeCaregiverAction() {
	'use server';
	await signIn('google', { redirectTo: '/caregiver/onboarding' });
}

export default async function Home() {
	const user = await getCurrentUser();

	if (!user) {
		return (
			<LandingPage
				findCaregiverAction={findCaregiverAction}
				becomeCaregiverAction={becomeCaregiverAction}
			/>
		);
	}

	if (user.roles.includes(UserRole.PARENT)) redirect('/children');

	redirect('/caregiver');
}
