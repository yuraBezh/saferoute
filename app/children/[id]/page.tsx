import type { GuardianRelationship } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const relationshipLabels: Record<GuardianRelationship, string> = {
	MOTHER: 'Mother',
	FATHER: 'Father',
	GUARDIAN: 'Guardian',
	OTHER: 'Other',
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

function getAge(birthDate: Date) {
	const today = new Date();
	let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
	const birthdayHasPassed =
		today.getUTCMonth() > birthDate.getUTCMonth() ||
		(today.getUTCMonth() === birthDate.getUTCMonth() &&
			today.getUTCDate() >= birthDate.getUTCDate());

	if (!birthdayHasPassed) age -= 1;

	return age;
}

export default async function ChildDetailsPage({
	params,
}: PageProps<'/children/[id]'>) {
	const { id } = await params;
	const child = await prisma.child.findUnique({
		where: { id },
		include: {
			guardians: {
				include: { user: true },
				orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
			},
		},
	});

	if (!child) notFound();

	const initials =
		`${child.firstName[0] ?? ''}${child.lastName[0] ?? ''}`.toUpperCase();

	return (
		<main className="min-h-screen bg-white px-3 py-5 text-gray-950 sm:px-6 sm:py-8">
			<div className="mx-auto w-full max-w-4xl">
				<Link
					href="/children"
					className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 20 20"
						className="size-4 fill-none stroke-current stroke-2"
					>
						<path
							d="m12.5 15-5-5 5-5M8 10h8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Children
				</Link>

				<section className="rounded-xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 items-center gap-4">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
								{initials}
							</div>
							<div className="min-w-0">
								<h1 className="truncate text-xl font-bold tracking-tight text-gray-950">
									{child.firstName} {child.lastName}
								</h1>
								<p className="mt-0.5 text-sm font-medium text-gray-500">
									{getAge(child.birthDate)} years old
								</p>
							</div>
						</div>

						<div className="flex gap-3 sm:shrink-0">
							<Link
								href={`/children/${child.id}/edit`}
								className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex-none"
							>
								<svg
									aria-hidden="true"
									viewBox="0 0 20 20"
									className="size-4 fill-none stroke-current stroke-[1.8]"
								>
									<path
										d="m12.8 4.2 3 3M5.5 14.5l2.9-.6 7.3-7.3a1.4 1.4 0 0 0-2-2l-7.3 7.3-.9 2.6Z"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								Edit
							</Link>
							<button
								type="button"
								className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 sm:flex-none"
							>
								<svg
									aria-hidden="true"
									viewBox="0 0 20 20"
									className="size-4 fill-none stroke-current stroke-[1.8]"
								>
									<path
										d="M4.5 6h11M8 3.5h4M6.5 6l.6 10h5.8l.6-10M8.5 8.5v5M11.5 8.5v5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								Delete
							</button>
						</div>
					</div>

					<hr className="my-5 border-gray-200" />

					<dl className="space-y-3 text-sm">
						<div className="flex items-center justify-between gap-6">
							<dt className="font-medium text-gray-500">Date of birth</dt>
							<dd className="text-right font-medium text-gray-900">
								{formatDate(child.birthDate)}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-6">
							<dt className="font-medium text-gray-500">Added</dt>
							<dd className="text-right font-medium text-gray-900">
								{formatDate(child.createdAt)}
							</dd>
						</div>
					</dl>
				</section>

				<section className="mt-4" aria-labelledby="guardians-heading">
					<h2
						id="guardians-heading"
						className="mb-3 text-lg font-bold tracking-tight"
					>
						Guardians
					</h2>
					<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						{child.guardians.length ? (
							child.guardians.map((guardian) => (
								<div
									key={guardian.id}
									className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="min-w-0">
										<h3 className="font-semibold text-gray-950">
											{guardian.user.fullName}
										</h3>
										<p className="mt-0.5 truncate text-sm text-gray-500">
											{relationshipLabels[guardian.relationship]} ·{' '}
											{guardian.user.email}
										</p>
									</div>
									<div className="flex flex-wrap gap-2 sm:justify-end">
										{guardian.isPrimary && (
											<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
												Primary
											</span>
										)}
										<span
											className={`rounded-full px-3 py-1 text-xs font-medium ${guardian.canBook ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
										>
											{guardian.canBook ? 'Can book' : 'View only'}
										</span>
									</div>
								</div>
							))
						) : (
							<p className="px-4 py-5 text-sm text-gray-500">
								No guardians added yet.
							</p>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
