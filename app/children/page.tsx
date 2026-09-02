import { AddLink } from '@/components/ui/add-link';
import { ChevronRightIcon } from '@/components/ui/icons';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import Link from 'next/link';
import { getAge } from '@/lib/children/get-age';
import { childrenText } from '@/lib/content/children-text';
import { getChildrenForCurrentUser } from '@/lib/data/children';
import { getPersonInitials } from '@/lib/person';

export default async function Children() {
	const children = await getChildrenForCurrentUser();
	const { title, childCount, addChild, yearsOld, guardianCount } = childrenText;

	return (
		<PageContainer>
			<div className="mb-5 flex items-center justify-between gap-4">
				<div>
					<PageTitle>{title}</PageTitle>
					<p className="mt-1 text-sm text-gray-500">{childCount(children.length)}</p>
				</div>
				<AddLink href="/children/new">{addChild}</AddLink>
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{children.map(({ id, firstName, lastName, birthDate, _count }) => (
					<Link
						key={id}
						href={`/children/${id}`}
						className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50"
					>
						<InitialsAvatar initials={getPersonInitials(firstName, lastName)} size="sm" />
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-gray-900">
								{firstName} {lastName}
							</p>
							<p className="text-sm text-gray-500">
								{getAge(birthDate)} {yearsOld} · {guardianCount(_count.guardians)}
							</p>
						</div>
						<ChevronRightIcon />
					</Link>
				))}
			</div>
		</PageContainer>
	);
}
