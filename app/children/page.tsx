import { ChevronRightIcon, PlusIcon } from '@/components/ui/icons';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { PageTitle } from '@/components/ui/page-title';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getAge } from '@/lib/children/get-age';
import { childrenText } from '@/lib/content/children-text';

export default async function Children() {
	const children = await prisma.child.findMany({
		include: {
			_count: { select: { guardians: true } },
		},
	});
	const { title, childCount, addChild, yearsOld, guardianCount } = childrenText;

	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-10">
			<div className="mb-5 flex items-center justify-between gap-4">
				<div>
					<PageTitle>{title}</PageTitle>
					<p className="mt-1 text-sm text-gray-500">
						{childCount(children.length)}
					</p>
				</div>
				<Link
					href="/children/new"
					className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
				>
					<PlusIcon />
					{addChild}
				</Link>
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{children.map((child) => (
					<Link
						key={child.id}
						href={`/children/${child.id}`}
						className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50"
					>
						<InitialsAvatar
							initials={`${child.firstName[0]}${child.lastName[0]}`}
							size="sm"
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-gray-900">
								{child.firstName} {child.lastName}
							</p>
							<p className="text-sm text-gray-500">
								{getAge(child.birthDate)} {yearsOld} ·{' '}
								{guardianCount(child._count.guardians)}
							</p>
						</div>
						<ChevronRightIcon />
					</Link>
				))}
			</div>
		</main>
	);
}
