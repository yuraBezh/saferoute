import { getCurrentUserId } from '@/lib/auth/current-user';
import { getBookingExpiresAt } from '@/lib/bookings/time';
import { toUtc } from '@/lib/date';
import { prisma } from '@/lib/prisma';
import type { BookingInput } from '@/lib/validation/booking';

const BOOKING_INCLUDE = {
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

	return prisma.booking.findFirst({
		where: { id, requestedByUserId: userId },
		include: BOOKING_INCLUDE,
	});
}

export async function getBookableChildrenForCurrentUser() {
	const userId = await getCurrentUserId();

	return prisma.child.findMany({
		where: { guardians: { some: { userId, canBook: true } } },
		select: { id: true, firstName: true, lastName: true },
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
	});
}

export async function hasOverlappingAcceptedBooking(
	childId: string,
	startsAt: Date,
	durationMin: number,
	excludeBookingId?: string,
) {
	const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);
	const excludedId = excludeBookingId ?? null;

	// The existing interval's end depends on another column, requiring SQL.
	const conflicts = await prisma.$queryRaw<{ id: string }[]>`
		SELECT id FROM "Booking"
		WHERE "childId" = ${childId}
			AND "status" = 'ACCEPTED'
			AND (${excludedId}::text IS NULL OR id <> ${excludedId}::text)
			AND "scheduledPickupAt" < ${endsAt}
			AND "scheduledPickupAt" + ("estimatedDurationMin" || ' minutes')::interval > ${startsAt}
		LIMIT 1
	`;

	return conflicts.length > 0;
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
		where: { id: childId, guardians: { some: { userId, canBook: true } } },
		select: { id: true },
	});
	if (!child) throw new Error('Child not found or booking not allowed');

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
		throw new Error('Location not found or access denied');
	}

	const pickup = locations.find((location) => location.id === pickupLocationId);
	if (!pickup) throw new Error('Pickup location not found or access denied');

	const scheduledPickupAt = toUtc(date, time, pickup.timezone);
	if (scheduledPickupAt <= new Date()) {
		throw new Error('Pickup time is in the past');
	}

	if (await hasOverlappingAcceptedBooking(childId, scheduledPickupAt, estimatedDurationMin)) {
		throw new Error('This child already has an accepted booking at that time');
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
		throw new Error('Booking cannot be cancelled');
	}
}
