import type { GuardianRelationship } from '@/app/generated/prisma/client';
import childDetailsText from '@/lib/content/child-details-text';

const { title, empty, primary, canBook, viewOnly, details, relationships } =
	childDetailsText.guardians;

type Guardian = {
	id: string;
	relationship: GuardianRelationship;
	isPrimary: boolean;
	canBook: boolean;
	user: {
		fullName: string;
		email: string;
	};
};

export function GuardiansList({ guardians }: { guardians: Guardian[] }) {
	return (
		<section className="mt-4" aria-labelledby="guardians-heading">
			<h2
				id="guardians-heading"
				className="mb-3 text-lg font-bold tracking-tight"
			>
				{title}
			</h2>
			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				{guardians.length ? (
					guardians.map((guardian) => (
						<div
							key={guardian.id}
							className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0">
								<h3 className="font-semibold text-gray-950">
									{guardian.user.fullName}
								</h3>
								<p className="mt-0.5 truncate text-sm text-gray-500">
									{details(
										relationships[guardian.relationship],
										guardian.user.email,
									)}
								</p>
							</div>
							<div className="flex flex-wrap gap-2 sm:justify-end">
								{guardian.isPrimary && (
									<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
										{primary}
									</span>
								)}
								<span
									className={`rounded-full px-3 py-1 text-xs font-medium ${guardian.canBook ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
								>
									{guardian.canBook ? canBook : viewOnly}
								</span>
							</div>
						</div>
					))
				) : (
					<p className="px-4 py-5 text-sm text-gray-500">{empty}</p>
				)}
			</div>
		</section>
	);
}
