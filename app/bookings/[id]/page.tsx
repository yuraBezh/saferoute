import { BookingStatus, TripStatus } from '@/generated/prisma/enums';
import { tripText } from '@/lib/content/trip-text';
import { TRIP_EVENT_TYPES } from '@/lib/trips/event-types';
import { notFound } from 'next/navigation';
import { cancelBookingAction } from '@/app/bookings/actions';
import { BookingRoute } from '@/components/booking-route';
import { BookingStatusBadge } from '@/components/booking-status';
import { TripStatusBadge } from '@/components/trip-status';
import { BackLink } from '@/components/ui/back-link';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { formatBookingPickup } from '@/lib/bookings/format';
import { bookingsText } from '@/lib/content/bookings-text';
import { getBookingForCurrentUser } from '@/lib/data/bookings';

const { handoffConfirmed } = TRIP_EVENT_TYPES;
const { title, cancel, details } = bookingsText;
const {
	statusLabels,
	pinLabel,
	pinShareHint,
	tripStatus,
	eventLog,
	eventPickupConfirmed,
	eventUpdated,
	unknownActor,
	pinHiddenHint,
} = tripText;

function formatTripEvent(event: {
	type: string;
	fromStatus: TripStatus | null;
	toStatus: TripStatus | null;
}) {
	if (event.type === handoffConfirmed) return eventPickupConfirmed;
	if (event.fromStatus && event.toStatus) {
		return `${statusLabels[event.fromStatus]} → ${statusLabels[event.toStatus]}`;
	}
	return eventUpdated;
}

export default async function BookingDetailsPage({ params }: PageProps<'/bookings/[id]'>) {
	const { id } = await params;
	const booking = await getBookingForCurrentUser(id);
	if (!booking) notFound();

	const { child, pickupLocation, activityLocation, dropoffLocation, caregiver, trip } = booking;

	return (
		<PageContainer>
			<BackLink href="/bookings" className="mb-5">
				{title}
			</BackLink>
			<section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<header className="flex flex-col gap-4 border-b border-gray-200 bg-blue-50/60 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-xl font-bold text-gray-950">
							{child.firstName} {child.lastName}
						</h1>
						{trip ? (
							<TripStatusBadge status={trip.status} />
						) : (
							<BookingStatusBadge status={booking.status} />
						)}
					</div>
					<div className="sm:text-right">
						<p className="text-sm font-semibold text-gray-800">
							{formatBookingPickup(booking.scheduledPickupAt, pickupLocation.timezone)}
						</p>
						{booking.status === BookingStatus.PENDING && booking.isRequester && (
							<div className="mt-3">
								<DeleteButton
									itemId={booking.id}
									deleteAction={cancelBookingAction}
									text={cancel}
								/>
							</div>
						)}
					</div>
				</header>

				<div className="grid gap-8 px-5 py-6 sm:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.75fr)] sm:px-6">
					<div>
						<h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-950 uppercase">
							{details.route}
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
						{trip ? (
							<div>
								<dt className="text-gray-500">{tripStatus}</dt>
								<dd className="mt-1 font-semibold text-gray-900">{statusLabels[trip.status]}</dd>
								<dt className="mt-4 text-gray-500">{pinLabel}</dt>
								{trip.pickupPin ? (
									<>
										<dd className="mt-2 inline-flex rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-3xl font-black tracking-[0.15em] text-blue-700">
											{trip.pickupPin}
										</dd>
										<dd className="mt-2 text-sm leading-6 text-gray-600">{pinShareHint}</dd>
									</>
								) : (
									<dd className="mt-2 text-sm leading-6 text-gray-600">{pinHiddenHint}</dd>
								)}
							</div>
						) : null}
						{booking.notes ? (
							<div>
								<dt className="text-gray-500">{details.notes}</dt>
								<dd className="mt-1 whitespace-pre-wrap text-gray-900">{booking.notes}</dd>
							</div>
						) : null}
					</dl>
				</div>
				{trip ? (
					<section className="border-t border-gray-200 px-5 py-6 sm:px-6">
						<h2 className="text-sm font-semibold tracking-wide text-gray-950 uppercase">
							{eventLog}
						</h2>
						<div className="mt-4 divide-y divide-gray-100">
							{trip.events.map((event) => (
								<div
									key={event.id}
									className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr_10rem] sm:gap-4"
								>
									<time className="text-sm text-gray-500">{event.occurredAt.toLocaleString()}</time>
									<span className="text-sm font-medium text-gray-900">
										{formatTripEvent(event)}
									</span>
									<span className="text-sm text-gray-500">
										{event.actor?.fullName ?? unknownActor}
									</span>
								</div>
							))}
						</div>
					</section>
				) : null}
			</section>
		</PageContainer>
	);
}
