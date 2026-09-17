import { formatBookingPickup } from '@/lib/bookings/format';
import Link from 'next/link';
import { tripText } from '@/lib/content/trip-text';
import { TripStatusBadge } from '@/components/trip-status';
import { assignmentsText } from '@/lib/content/assignments-text';
import type { getAcceptedBookingsForCurrentCaregiver } from '@/lib/data/caregiver-bookings';
import { formatAddress } from '@/lib/locations/format-address';
import { AssignmentRoute, type AssignmentRoutePoint } from './assignment-route';

const { duration, parentContact, phoneUnavailable, notes: notesLabel, noNotes } = assignmentsText;

type AcceptedBooking = Awaited<ReturnType<typeof getAcceptedBookingsForCurrentCaregiver>>[number];
type AddressLocation = Parameters<typeof formatAddress>[0] & { name: string };

const toAddressRoutePoint = ({ name, ...address }: AddressLocation): AssignmentRoutePoint => ({
	name,
	detail: formatAddress(address),
});

export function AcceptedBookingCard({ booking }: { booking: AcceptedBooking }) {
	const {
		child: { firstName, lastName },
		requestedBy: { fullName: parentName, phone },
		scheduledPickupAt,
		estimatedDurationMin,
		notes,
		pickupLocation,
		activityLocation,
		dropoffLocation,
		trip,
	} = booking;
	const { timezone } = pickupLocation;

	return (
		<li className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<header className="border-b border-gray-200 bg-blue-50/60 px-5 py-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
				<p className="text-xl font-bold text-gray-950">
					{firstName} {lastName}
				</p>
				<div className="mt-1 text-sm sm:mt-0 sm:text-right">
					<p className="font-semibold text-gray-800">
						{formatBookingPickup(scheduledPickupAt, timezone)}
					</p>
					<p className="mt-0.5 text-gray-500">{duration(estimatedDurationMin)}</p>
				</div>
			</header>
			<div className="grid gap-7 px-5 py-5 sm:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.65fr)]">
				<div>
					<AssignmentRoute
						pickup={toAddressRoutePoint(pickupLocation)}
						activity={activityLocation ? toAddressRoutePoint(activityLocation) : null}
						dropoff={toAddressRoutePoint(dropoffLocation)}
					/>
				</div>
				<div className="space-y-5 border-t border-gray-200 pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
					<div>
						<h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
							{parentContact}
						</h3>
						<p className="mt-2 font-semibold text-gray-950">{parentName}</p>
						<p className="mt-0.5 text-sm text-gray-600">{phone ?? phoneUnavailable}</p>
					</div>
					<div>
						<h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
							{notesLabel}
						</h3>
						<p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{notes || noNotes}</p>
					</div>
				</div>
			</div>
			{trip ? (
				<footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/70 px-5 py-4">
					<TripStatusBadge status={trip.status} />
					<Link
						href={'/trips/' + trip.id}
						className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
					>
						{tripText.openTrip}
					</Link>
				</footer>
			) : null}
		</li>
	);
}
