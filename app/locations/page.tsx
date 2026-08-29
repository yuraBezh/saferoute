import Link from 'next/link';
import {
	HomeIcon,
	MapPinIcon,
	PlusIcon,
	SchoolIcon,
} from '@/components/ui/icons';
import { EditLink } from '@/components/ui/edit-link';
import { PageTitle } from '@/components/ui/page-title';
import { LocationType } from '@/generated/prisma/enums';
import { locationsText } from '@/lib/content/locations-text';
import { formatAddress } from '@/lib/locations/format-address';
import { LocationsEmptyState } from './locations-empty-state';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { getLocationsForCurrentUser } from '@/lib/data/locations';

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
	const currentUserId = await getCurrentUserId();
	const locations = await getLocationsForCurrentUser();
	const locationsByType = Object.groupBy(
		locations,
		(location) => location.type,
	);

	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-10">
			<div className="mb-8 flex items-start justify-between gap-4">
				<div>
					<PageTitle>{locationsText.title}</PageTitle>
					<p className="mt-1 text-sm text-gray-500">
						{locationsText.description}
					</p>
				</div>
				{locations.length > 0 && (
					<Link
						href="/locations/new"
						className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
					>
						<PlusIcon />
						{locationsText.addLocation}
					</Link>
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
									{groupedLocations.map((location) => (
										<div
											key={location.id}
											className="flex items-center gap-4 px-5 py-4"
										>
											<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
												<LocationIcon />
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<p className="truncate font-semibold text-gray-950">
														{location.name}
													</p>
													{location.ownerUserId === null &&
														location.isVerified && (
															<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
																{locationsText.verified}
															</span>
														)}
												</div>
												<p className="mt-0.5 truncate text-sm text-gray-500">
													{formatAddress(location)}
												</p>
											</div>
											{location.ownerUserId === currentUserId && (
												<EditLink
													href={`/locations/${location.id}/edit`}
													label={locationsText.edit}
												/>
											)}
										</div>
									))}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</main>
	);
}
