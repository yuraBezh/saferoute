import type { GuardianRelationship } from '@/app/generated/prisma/client';
import { PageTitle } from '@/components/ui/page-title';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const relationshipLabels: Record<GuardianRelationship, string> = {
	MOTHER: 'mother',
	FATHER: 'father',
	GUARDIAN: 'guardian',
	OTHER: 'other',
};

export default async function Children() {
	const children = await prisma.child.findMany({
		include: {
			guardians: {
				include: { user: true },
			},
		},
	});

	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-10">
			<div className="mb-5 flex items-center justify-between gap-4">
				<div>
					<PageTitle>Children</PageTitle>
					<p className="mt-1 text-sm text-gray-500">
						{children.length} {children.length === 1 ? 'child' : 'children'}
					</p>
				</div>
				<Link
					href="/children/new"
					className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 20 20"
						className="size-4 fill-none stroke-current stroke-2"
					>
						<path d="M10 4v12M4 10h12" strokeLinecap="round" />
					</svg>
					Add child
				</Link>
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{children.map((child) => (
					<Link
						key={child.id}
						href={`/children/${child.id}`}
						className="block px-6 py-5 hover:bg-gray-50"
					>
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
					</Link>
				))}
			</div>
		</main>
	);
}
