import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { PageTitle } from '@/components/ui/page-title';
import { caregiverText } from '@/lib/content/caregiver-text';

const { title, description, cta } = caregiverText.invitation;

export const CaregiverInvitation = () => (
	<PageContainer size="form">
		<div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 sm:p-10">
			<PageTitle>{title}</PageTitle>
			<p className="mt-3 max-w-xl leading-7 text-gray-600">{description}</p>
			<Link
				href="/caregiver/onboarding"
				className="mt-7 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				{cta}
			</Link>
		</div>
	</PageContainer>
);
