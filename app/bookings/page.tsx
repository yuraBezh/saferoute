import Link from 'next/link';
import { AddLink } from '@/components/ui/add-link';
import { BookingRoute } from '@/components/booking-route';
import { BookingStatusBadge } from '@/components/booking-status';
import { ChevronRightIcon } from '@/components/ui/icons';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { PageTitle } from '@/components/ui/page-title';
import { formatBookingPickup } from '@/lib/bookings/format';
import { bookingsText } from '@/lib/content/bookings-text';
import { getBookingsForCurrentUser } from '@/lib/data/bookings';

export default async function BookingsPage() {
	const bookings = await getBookingsForCurrentUser();
	const { title, description, newBooking, bookingCount, empty } = bookingsText;

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
					<h2 className="font-semibold text-gray-950">{empty.title}</h2>
					<p className="mt-1 text-sm text-gray-600">{empty.description}</p>
					<Link
						className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
						href="/bookings/new"
					>
						{empty.cta}
					</Link>
				</section>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{bookings.map(
						({
							id,
							child,
							status,
							scheduledPickupAt,
							estimatedDurationMin,
							pickupLocation,
							activityLocation,
							dropoffLocation,
						}) => (
							<Link
								key={id}
								href={`/bookings/${id}`}
								className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="truncate font-semibold text-gray-950">
											{child.firstName} {child.lastName}
										</p>
										<p className="mt-1 text-sm text-gray-600">
											{formatBookingPickup(scheduledPickupAt, pickupLocation.timezone)}
										</p>
									</div>
									<BookingStatusBadge status={status} />
								</div>
								<div className="mt-5 border-t border-gray-100 pt-4">
									<BookingRoute
										pickup={pickupLocation.name}
										activity={activityLocation?.name}
										dropoff={dropoffLocation.name}
									/>
								</div>
								<div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-gray-500">
									<span>{bookingsText.details.minutes(estimatedDurationMin)}</span>
									<ChevronRightIcon />
								</div>
							</Link>
						),
					)}
				</div>
			)}
		</PageContainer>
	);
}
