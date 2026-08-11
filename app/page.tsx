import type { GuardianRelationship } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const relationshipLabels: Record<GuardianRelationship, string> = {
	MOTHER: 'mother',
	FATHER: 'father',
	GUARDIAN: 'guardian',
	OTHER: 'other',
};

export default async function Home() {
	const children = await prisma.child.findMany({
		include: {
			guardians: {
				include: {
					user: true,
				},
			},
		},
	});

	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-10">
			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-3xl font-bold text-gray-900">Children</h1>
				<Link
					href="/children/new"
					className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					Add child
				</Link>
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{children.map((child) => (
					<section key={child.id} className="px-6 py-5">
						<p className="font-semibold text-gray-900">
							{child.firstName} {child.lastName}
							<span className="font-normal text-gray-500">
								{' · '}
								{child.birthDate.toLocaleDateString('en-GB')}
							</span>
						</p>

						<div className="mt-2 space-y-1 pl-5 text-sm text-gray-600">
							{child.guardians.map((guardian) => (
								<p key={guardian.id}>
									{guardian.user.fullName}
									{' — '}
									{relationshipLabels[guardian.relationship]}
									{' · '}
									{guardian.canBook ? 'can book' : 'view only'}
								</p>
							))}
						</div>
					</section>
				))}
			</div>
		</main>
	);
}
