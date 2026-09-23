import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/landing-page';
import { UserRole } from '@/generated/prisma/enums';
import { getCurrentUser } from '@/lib/auth/current-user';
import { landingText } from '@/lib/content/landing-text';
import { becomeCaregiverAction, findCaregiverAction } from './actions';

export const metadata: Metadata = landingText.metadata;

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
