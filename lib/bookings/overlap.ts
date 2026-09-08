import type { Prisma } from '@/generated/prisma/client';
import { MS_PER_MINUTE } from '@/lib/date';

type TransactionClient = Prisma.TransactionClient;
type BookingInterval = {
	scheduledPickupAt: Date;
	estimatedDurationMin: number;
};

export function bookingIntervalsOverlap(first: BookingInterval, second: BookingInterval) {
	const firstStart = first.scheduledPickupAt.getTime();
	const secondStart = second.scheduledPickupAt.getTime();
	const firstEnd = firstStart + first.estimatedDurationMin * MS_PER_MINUTE;
	const secondEnd = secondStart + second.estimatedDurationMin * MS_PER_MINUTE;

	return firstStart < secondEnd && secondStart < firstEnd;
}

export async function hasOverlappingChildBooking(
	client: TransactionClient,
	childId: string,
	startsAt: Date,
	durationMin: number,
	excludeBookingId?: string,
) {
	const endsAt = new Date(startsAt.getTime() + durationMin * MS_PER_MINUTE);
	const excludedId = excludeBookingId ?? null;
	const conflicts = await client.$queryRaw<{ id: string }[]>`
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

export async function hasOverlappingCaregiverBooking(
	client: TransactionClient,
	caregiverUserId: string,
	startsAt: Date,
	durationMin: number,
) {
	const endsAt = new Date(startsAt.getTime() + durationMin * MS_PER_MINUTE);
	const conflicts = await client.$queryRaw<{ id: string }[]>`
		SELECT id FROM "Booking"
		WHERE "caregiverUserId" = ${caregiverUserId}
			AND "status" = 'ACCEPTED'
			AND "scheduledPickupAt" < ${endsAt}
			AND "scheduledPickupAt" + ("estimatedDurationMin" || ' minutes')::interval > ${startsAt}
		LIMIT 1
	`;

	return conflicts.length > 0;
}
