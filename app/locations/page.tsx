import { HomeIcon, MapPinIcon, SchoolIcon } from '@/components/ui/icons';
import { AddLink } from '@/components/ui/add-link';
import { EditLink } from '@/components/ui/edit-link';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { LocationType } from '@/generated/prisma/enums';
import { locationsText } from '@/lib/content/locations-text';
import { formatAddress } from '@/lib/locations/format-address';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { getLocationsForCurrentUser } from '@/lib/data/locations';
import { LocationsEmptyState } from './locations-empty-state';

const LOCATION_TYPE_ORDER = [
	LocationType.HOME,
	LocationType.SCHOOL,
	LocationType.ACTIVITY,
] as const;

const LOCATION_TYPE_ICONS = {
	[LocationType.HOME]: HomeIcon,
	[LocationType.SCHOOL]: SchoolIcon,
	[LocationType.ACTIVITY]: MapPinIcon,
} as const;

export default async function LocationsPage() {
	const [currentUserId, locations] = await Promise.all([
		getCurrentUserId(),
		getLocationsForCurrentUser(),
	]);
	const locationsByType = Object.groupBy(locations, (location) => location.type);

	return (
		<PageContainer>
			<div className="mb-8 flex items-start justify-between gap-4">
				<div>
					<PageTitle>{locationsText.title}</PageTitle>
					<PageDescription>{locationsText.description}</PageDescription>
				</div>
				{locations.length > 0 && (
					<AddLink href="/locations/new">{locationsText.addLocation}</AddLink>
				)}
			</div>

			{locations.length === 0 ? (
				<LocationsEmptyState />
			) : (
				<div className="space-y-8">
					{LOCATION_TYPE_ORDER.map((type) => {
						const groupedLocations = locationsByType[type] ?? [];
						const LocationIcon = LOCATION_TYPE_ICONS[type];

						if (groupedLocations.length === 0) return null;

						return (
							<section key={type}>
								<h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
									{locationsText.groupTitles[type]}
								</h2>
								<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
									{groupedLocations.map(({ id, name, ownerUserId, isVerified, ...address }) => (
										<div key={id} className="flex items-center gap-4 px-5 py-4">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
												<LocationIcon />
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<p className="truncate font-semibold text-gray-950">{name}</p>
													{ownerUserId === null && isVerified && (
														<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
															{locationsText.verified}
														</span>
													)}
												</div>
												<p className="mt-0.5 truncate text-sm text-gray-500">
													{formatAddress(address)}
												</p>
											</div>
											{ownerUserId === currentUserId && (
												<EditLink href={`/locations/${id}/edit`} label={locationsText.edit} />
											)}
										</div>
									))}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</PageContainer>
	);
}
