import childDetailsText from '@/lib/content/child-details-text';
import { childrenText } from '@/lib/content/children-text';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChildHeader } from './child-header';
import { GuardiansList } from './guardians-list';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { getChildForCurrentUser } from '@/lib/data/children';

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export default async function ChildDetailsPage({
	params,
}: PageProps<'/children/[id]'>) {
	const { id } = await params;
	const child = await getChildForCurrentUser(id);

	if (!child) notFound();

	return (
		<main className="min-h-screen bg-white px-3 py-5 text-gray-950 sm:px-6 sm:py-8">
			<div className="mx-auto w-full max-w-4xl">
				<Link
					href="/children"
					className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
				>
					<ArrowLeftIcon />
					{childrenText.title}
				</Link>

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
							<dt className="font-medium text-gray-500">
								{childDetailsText.details.dateOfBirth}
							</dt>
							<dd className="text-right font-medium text-gray-900">
								{formatDate(child.birthDate)}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-6">
							<dt className="font-medium text-gray-500">
								{childDetailsText.details.added}
							</dt>
							<dd className="text-right font-medium text-gray-900">
								{formatDate(child.createdAt)}
							</dd>
						</div>
					</dl>
				</section>

				<GuardiansList guardians={child.guardians} />
			</div>
		</main>
	);
}
