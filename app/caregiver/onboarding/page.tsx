import { redirect } from 'next/navigation';
import { createCaregiverProfileAction } from '@/app/caregiver/actions';
import { CaregiverForm } from '@/components/caregiver-form';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { caregiverText } from '@/lib/content/caregiver-text';
import { getCaregiverProfileForCurrentUser } from '@/lib/data/caregivers';

const { title, description, submit } = caregiverText.onboarding;

export default async function CaregiverOnboardingPage() {
	if (await getCaregiverProfileForCurrentUser()) redirect('/caregiver');

	return (
		<PageContainer size="form">
			<header className="mb-6">
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description}</PageDescription>
			</header>
			<CaregiverForm
				action={createCaregiverProfileAction}
				submitLabel={submit}
				cancelHref="/children"
			/>
		</PageContainer>
	);
}
