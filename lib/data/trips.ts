import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { TRIP_ERRORS } from '@/lib/trips/errors';
import { TripStatus } from '@/generated/prisma/enums';
import { canTransition, TripActor } from '@/lib/trips/state-machine';
import { TRIP_EVENT_TYPES } from '@/lib/trips/event-types';
import { isUniqueViolationOn } from '@/lib/db/retry';

const { notFound, invalidTransition, versionConflict, invalidPin } = TRIP_ERRORS;
const { statusChanged, handoffConfirmed } = TRIP_EVENT_TYPES;
const { EN_ROUTE_TO_SCHOOL, COMPLETED, CANCELLED, CHILD_PICKED_UP } = TripStatus;

const TRIP_INCLUDE = {
	child: { select: { id: true, firstName: true, lastName: true } },
	caregiver: { select: { id: true, fullName: true, avatarUrl: true } },
	booking: {
		select: {
			scheduledPickupAt: true,
			notes: true,
			activityLocationId: true,
			pickupLocation: true,
			activityLocation: true,
			dropoffLocation: true,
		},
	},
} as const;

export async function getTripForCaregiver(tripId: string) {
	const userId = await getCurrentUserId();

	return prisma.trip.findFirst({
		where: { id: tripId, caregiverUserId: userId },
		include: TRIP_INCLUDE,
	});
}

function timestampFor(status: TripStatus) {
	switch (status) {
		case EN_ROUTE_TO_SCHOOL:
			return { startedAt: new Date() };
		case COMPLETED:
			return { completedAt: new Date() };
		case CANCELLED:
			return { cancelledAt: new Date() };
		default:
			return {};
	}
}

export async function transitionTrip(params: {
	tripId: string;
	to: TripStatus;
	actor: TripActor;
	idempotencyKey: string;
	occurredAt?: Date;
}) {
	const userId = await getCurrentUserId();
	const { tripId, to, actor, idempotencyKey, occurredAt = new Date() } = params;

	try {
		return await prisma.$transaction(async (tx) => {
			const trip = await tx.trip.findFirst({
				where:
					actor === 'CAREGIVER'
						? { id: tripId, caregiverUserId: userId }
						: { id: tripId, child: { guardians: { some: { userId } } } },
				select: {
					id: true,
					status: true,
					version: true,
				},
			});

			if (!trip) throw new Error(notFound);
			const { status, version } = trip;

			if (!canTransition(status, to, actor)) {
				throw new Error(invalidTransition);
			}

			const result = await tx.trip.updateMany({
				where: { id: tripId, status, version },
				data: {
					status: to,
					version: { increment: 1 },
					...timestampFor(to),
				},
			});

			if (result.count === 0) throw new Error(versionConflict);

			await tx.tripEvent.create({
				data: {
					tripId,
					type: statusChanged,
					fromStatus: status,
					toStatus: to,
					actorUserId: userId,
					occurredAt,
					idempotencyKey,
				},
			});
		});
	} catch (error) {
		if (isUniqueViolationOn(error, 'idempotencyKey')) return;
		throw error;
	}
}

export async function confirmPickupWithPin(params: {
	tripId: string;
	pin: string;
	idempotencyKey: string;
}) {
	const userId = await getCurrentUserId();
	const { tripId, pin, idempotencyKey } = params;

	return prisma.$transaction(async (tx) => {
		const trip = await tx.trip.findFirst({
			where: {
				id: tripId,
				caregiverUserId: userId,
				status: EN_ROUTE_TO_SCHOOL,
			},
			select: { id: true, status: true, version: true, pickupPin: true },
		});

		if (!trip) throw new Error(notFound);
		const { status, version, pickupPin } = trip;
		if (pickupPin !== pin) throw new Error(invalidPin);

		const result = await tx.trip.updateMany({
			where: { id: tripId, status, version },
			data: { status: CHILD_PICKED_UP, version: { increment: 1 } },
		});

		if (result.count === 0) throw new Error(versionConflict);

		await tx.tripEvent.create({
			data: {
				tripId,
				type: handoffConfirmed,
				fromStatus: EN_ROUTE_TO_SCHOOL,
				toStatus: CHILD_PICKED_UP,
				actorUserId: userId,
				occurredAt: new Date(),
				idempotencyKey,
			},
		});
	});
}
