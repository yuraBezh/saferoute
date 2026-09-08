import { formatBookingPickup } from '@/lib/bookings/format';
import { assignmentsText } from '@/lib/content/assignments-text';
import type { getAvailableBookingsForCurrentCaregiver } from '@/lib/data/caregiver-bookings';
import { AcceptBookingForm } from './accept-booking-form';
import { AssignmentRoute, type AssignmentRoutePoint } from './assignment-route';

const { duration } = assignmentsText;

type AvailableBooking = Awaited<ReturnType<typeof getAvailableBookingsForCurrentCaregiver>>[number];

const toCityRoutePoint = ({
	name,
	city,
}: {
	name: string;
	city: string;
}): AssignmentRoutePoint => ({
	name,
	detail: city,
});

export function AvailableBookingCard({ booking }: { booking: AvailableBooking }) {
	const {
		id,
		child: { firstName },
		scheduledPickupAt,
		estimatedDurationMin,
		pickupLocation,
		activityLocation,
		dropoffLocation,
		hasCaregiverConflict,
	} = booking;
	const { timezone } = pickupLocation;

	return (
		<li className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(15rem,1.15fr)_auto] sm:items-start">
			<div>
				<p className="text-lg font-bold text-gray-950">{firstName}</p>
				<p className="mt-1 text-sm font-medium text-gray-700">
					{formatBookingPickup(scheduledPickupAt, timezone)}
				</p>
				<p className="mt-2 text-sm text-gray-500">{duration(estimatedDurationMin)}</p>
			</div>
			<AssignmentRoute
				pickup={toCityRoutePoint(pickupLocation)}
				activity={activityLocation ? toCityRoutePoint(activityLocation) : null}
				dropoff={toCityRoutePoint(dropoffLocation)}
			/>
			<AcceptBookingForm bookingId={id} hasCaregiverConflict={hasCaregiverConflict} />
		</li>
	);
}
