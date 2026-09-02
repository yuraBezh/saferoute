import { redirect } from 'next/navigation';
import { UserRole } from '@/generated/prisma/enums';
import { updateCaregiverProfileAction } from '@/app/caregiver/actions';
import { CaregiverForm } from '@/components/caregiver-form';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import { requireRole } from '@/lib/auth/roles';
import { caregiverText } from '@/lib/content/caregiver-text';
import { getCaregiverProfileForCurrentUser } from '@/lib/data/caregivers';
import { fromCents } from '@/lib/money';

export default async function EditCaregiverPage() {
	await requireRole(UserRole.CAREGIVER);
	const profile = await getCaregiverProfileForCurrentUser();
	if (!profile) redirect('/caregiver/onboarding');

	return (
		<PageContainer size="form">
			<header className="mb-6">
				<PageTitle>{caregiverText.edit.title}</PageTitle>
			</header>
			<CaregiverForm
				action={updateCaregiverProfileAction}
				submitLabel={caregiverText.edit.submit}
				cancelHref="/caregiver"
				defaultValues={{
					bio: profile.bio ?? '',
					hourlyRate: fromCents(profile.hourlyRateCents),
					vehicleMake: profile.vehicleMake ?? '',
					vehicleModel: profile.vehicleModel ?? '',
					vehicleYear: profile.vehicleYear?.toString() ?? '',
					vehicleColor: profile.vehicleColor ?? '',
					licensePlate: profile.licensePlate ?? '',
				}}
			/>
		</PageContainer>
	);
}
