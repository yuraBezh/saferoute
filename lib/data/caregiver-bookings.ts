import type { Prisma } from '@/generated/prisma/client';
import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { hasRole, requireRole } from '@/lib/auth/roles';
import {
	bookingIntervalsOverlap,
	hasOverlappingCaregiverBooking,
	hasOverlappingChildBooking,
} from '@/lib/bookings/overlap';
import { CAREGIVER_ERRORS } from '@/lib/caregiver/errors';
import { getCaregiverStatus } from '@/lib/data/caregivers';
import { hasDatabaseErrorCode, withSerializableRetry } from '@/lib/db/retry';
import { prisma } from '@/lib/prisma';

const { notVerified, notAvailable, childConflict, caregiverConflict } = CAREGIVER_ERRORS;
const EXCLUSION_VIOLATION = '23P01';
const CHILD_OVERLAP_CONSTRAINT = 'Booking_no_overlapping_child';
const UNVERIFIED_READ_WARNING = 'Blocked caregiver booking read for an unverified profile';

class AcceptancePreconditionFailed extends Error {}

const hasErrorText = (error: unknown, expectedText: string): boolean => {
	if (!error || typeof error !== 'object') return false;
	if (
		('originalMessage' in error &&
			typeof error.originalMessage === 'string' &&
			error.originalMessage.includes(expectedText)) ||
		('message' in error &&
			typeof error.message === 'string' &&
			error.message.includes(expectedText))
	) {
		return true;
	}

	return (
		('meta' in error && hasErrorText(error.meta, expectedText)) ||
		('driverAdapterError' in error && hasErrorText(error.driverAdapterError, expectedText)) ||
		('cause' in error && hasErrorText(error.cause, expectedText))
	);
};

async function getVerifiedCaregiverUserIdForRead() {
	const [userId, status, isCaregiver] = await Promise.all([
		getCurrentUserId(),
		getCaregiverStatus(),
		hasRole(UserRole.CAREGIVER),
	]);

	if (isCaregiver && status === CaregiverStatus.VERIFIED) return userId;

	console.warn(UNVERIFIED_READ_WARNING);
	return null;
}

export async function requireVerifiedCaregiver() {
	await requireRole(UserRole.CAREGIVER);
	const [userId, status] = await Promise.all([getCurrentUserId(), getCaregiverStatus()]);

	if (status !== CaregiverStatus.VERIFIED) throw new Error(notVerified);

	return { userId };
}

const AVAILABLE_INCLUDE = {
	child: { select: { firstName: true } },
	pickupLocation: { select: { name: true, city: true, timezone: true } },
	activityLocation: { select: { name: true, city: true } },
	dropoffLocation: { select: { name: true, city: true } },
} as const;

export async function getAvailableBookingsForCurrentCaregiver() {
	const userId = await getVerifiedCaregiverUserIdForRead();
	if (!userId) return [];

	const [availableBookings, acceptedBookings] = await Promise.all([
		prisma.booking.findMany({
			where: {
				status: 'PENDING',
				caregiverUserId: null,
				requestedByUserId: { not: userId },
				expiresAt: { gt: new Date() },
			},
			include: AVAILABLE_INCLUDE,
			orderBy: { scheduledPickupAt: 'asc' },
		}),
		prisma.booking.findMany({
			where: { caregiverUserId: userId, status: 'ACCEPTED' },
			select: { scheduledPickupAt: true, estimatedDurationMin: true },
		}),
	]);

	type AvailableBooking = (typeof availableBookings)[number];

	const hasCaregiverConflict = (booking: AvailableBooking) =>
		acceptedBookings.some((acceptedBooking) => bookingIntervalsOverlap(booking, acceptedBooking));

	const addCaregiverConflict = (booking: AvailableBooking) => ({
		...booking,
		hasCaregiverConflict: hasCaregiverConflict(booking),
	});

	return availableBookings.map(addCaregiverConflict);
}

const ACCEPTED_INCLUDE = {
	child: { select: { id: true, firstName: true, lastName: true } },
	requestedBy: { select: { fullName: true, phone: true } },
	pickupLocation: true,
	activityLocation: true,
	dropoffLocation: true,
} as const;

export async function getAcceptedBookingsForCurrentCaregiver() {
	const userId = await getVerifiedCaregiverUserIdForRead();
	if (!userId) return [];

	return prisma.booking.findMany({
		where: { caregiverUserId: userId, status: 'ACCEPTED' },
		include: ACCEPTED_INCLUDE,
		orderBy: { scheduledPickupAt: 'asc' },
	});
}

async function acceptBookingInTransaction(
	tx: Prisma.TransactionClient,
	bookingId: string,
	caregiverUserId: string,
) {
	const booking = await tx.booking.findFirst({
		where: {
			id: bookingId,
			status: 'PENDING',
			caregiverUserId: null,
			expiresAt: { gt: new Date() },
		},
		select: {
			id: true,
			childId: true,
			scheduledPickupAt: true,
			estimatedDurationMin: true,
		},
	});

	if (!booking) throw new Error(notAvailable);

	const { childId, scheduledPickupAt, estimatedDurationMin } = booking;

	if (
		await hasOverlappingChildBooking(
			tx,
			childId,
			scheduledPickupAt,
			estimatedDurationMin,
			bookingId,
		)
	) {
		throw new Error(childConflict);
	}

	if (
		await hasOverlappingCaregiverBooking(
			tx,
			caregiverUserId,
			scheduledPickupAt,
			estimatedDurationMin,
		)
	) {
		throw new Error(caregiverConflict);
	}

	const count = await tx.$executeRaw`
		UPDATE "Booking"
		SET "caregiverUserId" = ${caregiverUserId},
			"status" = 'ACCEPTED',
			"updatedAt" = CURRENT_TIMESTAMP
		WHERE "id" = ${bookingId}
			AND "status" = 'PENDING'
			AND "caregiverUserId" IS NULL
			AND "requestedByUserId" <> ${caregiverUserId}
			AND "expiresAt" > CURRENT_TIMESTAMP
			AND EXISTS (
				SELECT 1 FROM "CaregiverProfile"
				WHERE "userId" = ${caregiverUserId}
					AND "status" = 'VERIFIED'
			)
			AND EXISTS (
				SELECT 1 FROM "User"
				WHERE "id" = ${caregiverUserId}
					AND 'CAREGIVER' = ANY("roles")
			)
	`;

	if (count === 0) throw new AcceptancePreconditionFailed();
}

export async function acceptBookingForCurrentCaregiver(bookingId: string) {
	const { userId } = await requireVerifiedCaregiver();

	try {
		return await withSerializableRetry(() =>
			prisma.$transaction((tx) => acceptBookingInTransaction(tx, bookingId, userId), {
				isolationLevel: 'Serializable',
			}),
		);
	} catch (error) {
		if (error instanceof AcceptancePreconditionFailed) {
			const status = await getCaregiverStatus();
			throw new Error(status === CaregiverStatus.VERIFIED ? notAvailable : notVerified);
		}

		if (hasDatabaseErrorCode(error, EXCLUSION_VIOLATION)) {
			throw new Error(
				hasErrorText(error, CHILD_OVERLAP_CONSTRAINT) ? childConflict : caregiverConflict,
			);
		}

		throw error;
	}
}
