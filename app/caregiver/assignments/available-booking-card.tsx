import { formatBookingPickup } from '@/lib/bookings/format';
import { assignmentsText } from '@/lib/content/assignments-text';
import type { getAvailableBookingsForCurrentCaregiver } from '@/lib/data/caregiver-bookings';
import { acceptBookingAction } from './actions';
import { AssignmentRoute, type AssignmentRoutePoint } from './assignment-route';

const { acceptLabel, duration } = assignmentsText;

type AvailableBooking = Awaited<ReturnType<typeof getAvailableBookingsForCurrentCaregiver>>[number];
type FormAction = (formData: FormData) => Promise<void>;

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
	} = booking;
	const { timezone } = pickupLocation;
	const acceptAction: FormAction = acceptBookingAction.bind(null, id);

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
			<form action={acceptAction}>
				<button
					type="submit"
					className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
				>
					{acceptLabel}
				</button>
			</form>
		</li>
	);
}
