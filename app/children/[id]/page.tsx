import childDetailsText from '@/lib/content/child-details-text';
import { childrenText } from '@/lib/content/children-text';
import { notFound } from 'next/navigation';
import { ChildHeader } from './child-header';
import { GuardiansList } from './guardians-list';
import { BackLink } from '@/components/ui/back-link';
import { PageContainer } from '@/components/ui/page-container';
import { getChildForCurrentUser } from '@/lib/data/children';

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export default async function ChildDetailsPage({ params }: PageProps<'/children/[id]'>) {
	const { id } = await params;
	const child = await getChildForCurrentUser(id);

	if (!child) notFound();

	return (
		<PageContainer>
			<BackLink href="/children" className="mb-4">
				{childrenText.title}
			</BackLink>

			<section className="rounded-xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
				<ChildHeader
					id={child.id}
					firstName={child.firstName}
					lastName={child.lastName}
					birthDate={child.birthDate}
				/>

				<hr className="my-5 border-gray-200" />

				<dl className="space-y-3 text-sm">
					<div className="flex items-center justify-between gap-6">
						<dt className="font-medium text-gray-500">{childDetailsText.details.dateOfBirth}</dt>
						<dd className="text-right font-medium text-gray-900">{formatDate(child.birthDate)}</dd>
					</div>
					<div className="flex items-center justify-between gap-6">
						<dt className="font-medium text-gray-500">{childDetailsText.details.added}</dt>
						<dd className="text-right font-medium text-gray-900">{formatDate(child.createdAt)}</dd>
					</div>
				</dl>
			</section>

			<GuardiansList guardians={child.guardians} />
		</PageContainer>
	);
}
