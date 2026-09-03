import Link from 'next/link';
import { CaregiverInvitation } from '@/app/caregiver/caregiver-invitation';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import { caregiverText, formatHourlyRate } from '@/lib/content/caregiver-text';
import { getCaregiverProfileForCurrentUser } from '@/lib/data/caregivers';
import { fromCents } from '@/lib/money';

const {
	title,
	status,
	statusLabels,
	edit,
	rate,
	vehicle,
	noVehicle,
	documents,
	noDocuments,
	documentTypeLabels,
	documentStatusLabels,
} = caregiverText.profile;

type Vehicle = {
	vehicleYear: number | null;
	vehicleColor: string | null;
	vehicleMake: string | null;
	vehicleModel: string | null;
};

const formatVehicle = (vehicle: Vehicle) =>
	[vehicle.vehicleYear, vehicle.vehicleColor, vehicle.vehicleMake, vehicle.vehicleModel]
		.filter(Boolean)
		.join(' ');

export default async function CaregiverPage() {
	const profile = await getCaregiverProfileForCurrentUser();
	if (!profile) return <CaregiverInvitation />;

	const { status: caregiverStatus, bio, hourlyRateCents, verificationDocuments } = profile;
	const vehicleDescription = formatVehicle(profile);

	return (
		<PageContainer>
			<div className="mb-8 flex items-start justify-between gap-4">
				<div>
					<PageTitle>{title}</PageTitle>
					<p className="mt-2 text-sm font-medium text-gray-600">
						{status}: {statusLabels[caregiverStatus]}
					</p>
				</div>
				<Link
					href="/caregiver/edit"
					className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
				>
					{edit}
				</Link>
			</div>

			<div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				{bio ? <p className="text-gray-700">{bio}</p> : null}
				<dl className="grid gap-5 sm:grid-cols-2">
					<div>
						<dt className="text-sm text-gray-500">{rate}</dt>
						<dd className="font-semibold text-gray-950">
							{formatHourlyRate(fromCents(hourlyRateCents))}
						</dd>
					</div>
					<div>
						<dt className="text-sm text-gray-500">{vehicle}</dt>
						<dd className="font-semibold text-gray-950">{vehicleDescription || noVehicle}</dd>
					</div>
				</dl>
			</div>

			<section className="mt-8">
				<h2 className="text-lg font-semibold text-gray-950">{documents}</h2>
				{verificationDocuments.length === 0 ? (
					<p className="mt-2 text-sm text-gray-500">{noDocuments}</p>
				) : (
					<ul className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
						{verificationDocuments.map(({ id, type, status: docStatus }) => (
							<li key={id} className="flex justify-between gap-4 px-4 py-3 text-sm">
								<span>{documentTypeLabels[type]}</span>
								<span>{documentStatusLabels[docStatus]}</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</PageContainer>
	);
}
