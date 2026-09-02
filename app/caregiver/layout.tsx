import type { ReactNode } from 'react';
import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { PageTitle } from '@/components/ui/page-title';
import { hasRole } from '@/lib/auth/roles';
import { caregiverText } from '@/lib/content/caregiver-text';
import { getCaregiverProfileForCurrentUser } from '@/lib/data/caregivers';

const { title, description } = caregiverText.accessRevoked;

export default async function CaregiverLayout({ children }: { children: ReactNode }) {
	const [isCaregiver, profile] = await Promise.all([
		hasRole(UserRole.CAREGIVER),
		getCaregiverProfileForCurrentUser(),
	]);
	const accessRevoked = profile && (!isCaregiver || profile.status === CaregiverStatus.SUSPENDED);

	if (accessRevoked) {
		return (
			<PageContainer size="form">
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description}</PageDescription>
			</PageContainer>
		);
	}

	return children;
}
