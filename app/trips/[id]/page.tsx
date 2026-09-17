import { TripStatus } from '@/generated/prisma/enums';
import { notFound } from 'next/navigation';
import { BookingRoute } from '@/components/booking-route';
import { PageContainer } from '@/components/ui/page-container';
import { PageTitle } from '@/components/ui/page-title';
import { getTripForCaregiver } from '@/lib/data/trips';
import { getAvailableTransitions } from '@/lib/trips/state-machine';
import { tripText } from '@/lib/content/trip-text';
import { PickupForm } from '../trip-pickup-form';
import { TripTransitionForm } from '../trip-transition-form';

const { statusLabels, actionLabels, caregiverView, currentStatus, route, availableActions } =
	tripText;

const getActionLabel = (status: TripStatus) => actionLabels[status as keyof typeof actionLabels];

export default async function TripPage({ params }: PageProps<'/trips/[id]'>) {
	const { id } = await params;

	const trip = await getTripForCaregiver(id);
	if (!trip) notFound();

	const { child, booking, status } = trip;
	const { pickupLocation, activityLocation, dropoffLocation, activityLocationId } = booking;
	const transitions = getAvailableTransitions(status, 'CAREGIVER').filter(
		(to) =>
			status !== TripStatus.CHILD_PICKED_UP ||
			activityLocationId ||
			to === TripStatus.EN_ROUTE_HOME,
	);

	return (
		<PageContainer>
			<PageTitle>
				{child.firstName} {child.lastName}
			</PageTitle>
			<p className="mt-2 text-sm text-gray-600">{caregiverView}</p>
			<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
				<section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<p className="text-sm text-gray-500">{currentStatus}</p>
					<p className="mt-1 text-2xl font-bold text-gray-950">{statusLabels[status]}</p>
					<h2 className="mt-8 mb-4 text-sm font-semibold tracking-wide text-gray-950 uppercase">
						{route}
					</h2>
					<BookingRoute
						pickup={pickupLocation.name}
						activity={activityLocation?.name}
						dropoff={dropoffLocation.name}
					/>
				</section>
				<section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="text-sm font-semibold tracking-wide text-gray-950 uppercase">
						{availableActions}
					</h2>
					<div className="mt-5 space-y-4">
						{transitions.map((to) =>
							to === TripStatus.CHILD_PICKED_UP ? (
								<PickupForm key={to} tripId={id} />
							) : (
								<TripTransitionForm key={to} tripId={id} to={to} label={getActionLabel(to)} />
							),
						)}
					</div>
				</section>
			</div>
		</PageContainer>
	);
}
