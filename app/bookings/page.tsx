import Link from 'next/link';
import { AddLink } from '@/components/ui/add-link';
import { BookingStatusBadge } from '@/components/booking-status';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { PageTitle } from '@/components/ui/page-title';
import { formatBookingPickup } from '@/lib/bookings/format';
import { displayStatus } from '@/lib/bookings/status';
import { bookingsText } from '@/lib/content/bookings-text';
import { getBookingsForCurrentUser } from '@/lib/data/bookings';

const {
	title,
	description,
	newBooking,
	bookingCount,
	empty: { title: emptyTitle, description: emptyDescription, cta: emptyCta },
} = bookingsText;

export default async function BookingsPage() {
	const bookings = await getBookingsForCurrentUser();

	return (
		<PageContainer>
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<PageTitle>{title}</PageTitle>
					<PageDescription>{description}</PageDescription>
					<p className="mt-1 text-xs font-medium text-gray-500">{bookingCount(bookings.length)}</p>
				</div>
				<AddLink href="/bookings/new">{newBooking}</AddLink>
			</div>

			{bookings.length === 0 ? (
				<section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
					<h2 className="font-semibold text-gray-950">{emptyTitle}</h2>
					<p className="mt-1 text-sm text-gray-600">{emptyDescription}</p>
					<Link
						className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
						href="/bookings/new"
					>
						{emptyCta}
					</Link>
				</section>
			) : (
				<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					{bookings.map(
						({
							id,
							child: { firstName, lastName },
							status,
							expiresAt,
							scheduledPickupAt,
							pickupLocation: { name: pickupLocationName, timezone },
							activityLocation,
							dropoffLocation,
						}) => {
							const route = [pickupLocationName, activityLocation?.name, dropoffLocation.name]
								.filter((name): name is string => Boolean(name))
								.join(' → ');

							return (
								<Link
									key={id}
									href={`/bookings/${id}`}
									className="grid gap-3 px-5 py-4 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 sm:grid-cols-[minmax(9rem,0.8fr)_minmax(13rem,1fr)_minmax(0,1.5fr)_auto] sm:items-center"
								>
									<p className="truncate font-semibold text-gray-950">
										{firstName} {lastName}
									</p>
									<p className="text-sm text-gray-600">
										{formatBookingPickup(scheduledPickupAt, timezone)}
									</p>
									<p className="truncate text-sm font-medium text-gray-800">{route}</p>
									<div className="justify-self-start sm:justify-self-end">
										<BookingStatusBadge status={displayStatus({ status, expiresAt })} />
									</div>
								</Link>
							);
						},
					)}
				</div>
			)}
		</PageContainer>
	);
}
