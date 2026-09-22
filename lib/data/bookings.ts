import { getCurrentUserId } from '@/lib/auth/current-user';
import { getBookingExpiresAt } from '@/lib/bookings/time';
import { BOOKING_DATA_ERRORS } from '@/lib/bookings/errors';
import { hasOverlappingChildBooking } from '@/lib/bookings/overlap';
import { toUtc } from '@/lib/date';
import { ownedChildWhere } from '@/lib/data/children';
import { prisma } from '@/lib/prisma';
import type { BookingInput } from '@/lib/validation/booking';

const BOOKING_INCLUDE = {
	trip: {
		select: {
			id: true,
			status: true,
			pickupPin: true,
			events: {
				orderBy: { occurredAt: 'asc' },
				include: { actor: { select: { fullName: true } } },
			},
		},
	},
	child: { select: { id: true, firstName: true, lastName: true } },
	caregiver: { select: { id: true, fullName: true, avatarUrl: true } },
	pickupLocation: { select: { id: true, name: true, timezone: true } },
	activityLocation: { select: { id: true, name: true } },
	dropoffLocation: { select: { id: true, name: true } },
} as const;

export async function getAccessibleLocation(id: string) {
	const userId = await getCurrentUserId();

	return prisma.location.findFirst({
		where: { id, OR: [{ ownerUserId: userId }, { ownerUserId: null }] },
	});
}

export async function getBookingsForCurrentUser() {
	const userId = await getCurrentUserId();

	return prisma.booking.findMany({
		where: { requestedByUserId: userId },
		include: BOOKING_INCLUDE,
		orderBy: { scheduledPickupAt: 'desc' },
	});
}

export async function getBookingForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	const booking = await prisma.booking.findFirst({
		where: { id, child: { guardians: { some: { userId } } } },
		include: BOOKING_INCLUDE,
	});
	if (!booking) return null;

	const guardian = await prisma.childGuardian.findUnique({
		where: { childId_userId: { childId: booking.childId, userId } },
		select: { canApproveHandoff: true },
	});

	return {
		...booking,
		isRequester: booking.requestedByUserId === userId,
		trip:
			booking.trip && !guardian?.canApproveHandoff
				? { ...booking.trip, pickupPin: null }
				: booking.trip,
	};
}

export async function getBookableChildrenForCurrentUser() {
	const userId = await getCurrentUserId();

	return prisma.child.findMany({
		where: ownedChildWhere(userId, { canBook: true }),
		select: { id: true, firstName: true, lastName: true },
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
	});
}

export async function createBookingForCurrentUser(data: BookingInput) {
	const userId = await getCurrentUserId();
	const {
		childId,
		pickupLocationId,
		dropoffLocationId,
		activityLocationId,
		date,
		time,
		estimatedDurationMin,
		notes,
	} = data;

	const child = await prisma.child.findFirst({
		where: ownedChildWhere(userId, { id: childId, canBook: true }),
		select: { id: true },
	});
	if (!child) throw new Error(BOOKING_DATA_ERRORS.childNotBookable);

	const locationIds = [pickupLocationId, dropoffLocationId, activityLocationId].filter(
		(id): id is string => Boolean(id),
	);
	const locations = await prisma.location.findMany({
		where: {
			id: { in: locationIds },
			OR: [{ ownerUserId: userId }, { ownerUserId: null }],
		},
		select: { id: true, timezone: true },
	});

	if (locations.length !== new Set(locationIds).size) {
		throw new Error(BOOKING_DATA_ERRORS.locationUnavailable);
	}

	const pickup = locations.find((location) => location.id === pickupLocationId);
	if (!pickup) throw new Error(BOOKING_DATA_ERRORS.pickupLocationUnavailable);

	const scheduledPickupAt = toUtc(date, time, pickup.timezone);
	if (scheduledPickupAt <= new Date()) {
		throw new Error(BOOKING_DATA_ERRORS.pickupInPast);
	}

	if (
		await hasOverlappingChildBooking(prisma, {
			childId,
			startsAt: scheduledPickupAt,
			durationMin: estimatedDurationMin,
		})
	) {
		throw new Error(BOOKING_DATA_ERRORS.overlappingBooking);
	}

	return prisma.booking.create({
		data: {
			childId,
			requestedByUserId: userId,
			pickupLocationId,
			activityLocationId: activityLocationId ?? null,
			dropoffLocationId,
			scheduledPickupAt,
			estimatedDurationMin,
			notes: notes ?? null,
			expiresAt: getBookingExpiresAt(scheduledPickupAt),
		},
	});
}

export async function cancelBookingForCurrentUser(id: string) {
	const userId = await getCurrentUserId();
	const result = await prisma.booking.updateMany({
		where: { id, requestedByUserId: userId, status: 'PENDING' },
		data: { status: 'CANCELLED' },
	});

	if (result.count === 0) {
		throw new Error(BOOKING_DATA_ERRORS.cannotCancel);
	}
}
