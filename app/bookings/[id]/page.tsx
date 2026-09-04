import { BookingStatus } from '@/generated/prisma/enums';
import { notFound } from 'next/navigation';
import { cancelBookingAction } from '@/app/bookings/actions';
import { BookingRoute } from '@/components/booking-route';
import { BookingStatusBadge } from '@/components/booking-status';
import { BackLink } from '@/components/ui/back-link';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { formatBookingPickup } from '@/lib/bookings/format';
import { bookingsText } from '@/lib/content/bookings-text';
import { getBookingForCurrentUser } from '@/lib/data/bookings';

export default async function BookingDetailsPage({ params }: PageProps<'/bookings/[id]'>) {
	const { id } = await params;
	const booking = await getBookingForCurrentUser(id);
	if (!booking) notFound();

	const { child, pickupLocation, activityLocation, dropoffLocation, caregiver } = booking;
	const details = bookingsText.details;

	return (
		<PageContainer>
			<BackLink href="/bookings" className="mb-5">
				{bookingsText.title}
			</BackLink>
			<section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<header className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight text-gray-950">
								{child.firstName} {child.lastName}
							</h1>
							<BookingStatusBadge status={booking.status} />
						</div>
						<p className="mt-2 text-sm font-medium text-gray-600">
							{formatBookingPickup(booking.scheduledPickupAt, pickupLocation.timezone)}
						</p>
					</div>
					{booking.status === BookingStatus.PENDING ? (
						<DeleteButton
							itemId={booking.id}
							deleteAction={cancelBookingAction}
							text={bookingsText.cancel}
						/>
					) : null}
				</header>

				<div className="grid gap-8 px-5 py-6 sm:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.75fr)] sm:px-6">
					<div>
						<h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-950 uppercase">
							Route
						</h2>
						<BookingRoute
							pickup={pickupLocation.name}
							activity={activityLocation?.name}
							dropoff={dropoffLocation.name}
						/>
					</div>
					<dl className="space-y-4 border-t border-gray-200 pt-5 text-sm sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
						<div>
							<dt className="text-gray-500">{details.duration}</dt>
							<dd className="mt-1 font-semibold text-gray-900">
								{details.minutes(booking.estimatedDurationMin)}
							</dd>
						</div>
						<div>
							<dt className="text-gray-500">{details.caregiver}</dt>
							<dd className="mt-1 font-semibold text-gray-900">
								{caregiver?.fullName ?? details.unassigned}
							</dd>
						</div>
						{booking.notes ? (
							<div>
								<dt className="text-gray-500">{details.notes}</dt>
								<dd className="mt-1 whitespace-pre-wrap text-gray-900">{booking.notes}</dd>
							</div>
						) : null}
					</dl>
				</div>
			</section>
		</PageContainer>
	);
}
