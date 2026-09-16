import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaregiverStatus, TripStatus, UserRole } from '@/generated/prisma/enums';
import { CAREGIVER_ERRORS } from '@/lib/caregiver/errors';
import { TRIP_EVENT_TYPES } from '@/lib/trips/event-types';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	hasRole: vi.fn(),
	requireRole: vi.fn(),
	getCaregiverStatus: vi.fn(),
	findBookings: vi.fn(),
	findBooking: vi.fn(),
	hasChildOverlap: vi.fn(),
	hasCaregiverOverlap: vi.fn(),
	bookingIntervalsOverlap: vi.fn(),
	executeRaw: vi.fn(),
	transaction: vi.fn(),
	createTrip: vi.fn(),
	createTripEvent: vi.fn(),
	generatePickupPin: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/auth/roles', () => ({
	hasRole: mocks.hasRole,
	requireRole: mocks.requireRole,
}));
vi.mock('@/lib/data/caregivers', () => ({ getCaregiverStatus: mocks.getCaregiverStatus }));
vi.mock('@/lib/bookings/overlap', () => ({
	hasOverlappingChildBooking: mocks.hasChildOverlap,
	hasOverlappingCaregiverBooking: mocks.hasCaregiverOverlap,
	bookingIntervalsOverlap: mocks.bookingIntervalsOverlap,
}));
vi.mock('@/lib/trips/pin', () => ({ generatePickupPin: mocks.generatePickupPin }));
vi.mock('@/lib/prisma', () => ({
	prisma: {
		booking: {
			findMany: mocks.findBookings,
			findFirst: mocks.findBooking,
		},
		$executeRaw: mocks.executeRaw,
		$transaction: mocks.transaction,
	},
}));

import {
	acceptBookingForCurrentCaregiver,
	getAcceptedBookingsForCurrentCaregiver,
	getAvailableBookingsForCurrentCaregiver,
} from './caregiver-bookings';

const caregiver = { userId: 'caregiver-1' };
const booking = {
	id: 'booking-1',
	childId: 'child-1',
	scheduledPickupAt: new Date('2026-09-15T20:30:00.000Z'),
	estimatedDurationMin: 45,
};
const trip = { id: 'trip-1' };
const pickupPin = '012345';
const childConstraintError = {
	meta: {
		code: '23P01',
		message: 'conflicting key violates exclusion constraint "Booking_no_overlapping_child"',
	},
};

describe('caregiver booking data access', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(caregiver.userId);
		mocks.hasRole.mockResolvedValue(true);
		mocks.requireRole.mockResolvedValue(undefined);
		mocks.getCaregiverStatus.mockResolvedValue(CaregiverStatus.VERIFIED);
		mocks.findBookings.mockResolvedValue([booking]);
		mocks.findBooking.mockResolvedValue(booking);
		mocks.hasChildOverlap.mockResolvedValue(false);
		mocks.hasCaregiverOverlap.mockResolvedValue(false);
		mocks.bookingIntervalsOverlap.mockReturnValue(false);
		mocks.executeRaw.mockResolvedValue(1);
		mocks.createTrip.mockResolvedValue(trip);
		mocks.createTripEvent.mockResolvedValue(undefined);
		mocks.generatePickupPin.mockReturnValue(pickupPin);
		mocks.transaction.mockImplementation((operation) =>
			operation({
				booking: { findFirst: mocks.findBooking },
				trip: { create: mocks.createTrip },
				tripEvent: { create: mocks.createTripEvent },
				$queryRaw: vi.fn(),
				$executeRaw: mocks.executeRaw,
			}),
		);
	});

	it('returns an empty list and warns when an unverified caregiver reads bookings', async () => {
		const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		mocks.getCaregiverStatus.mockResolvedValue(CaregiverStatus.PENDING_VERIFICATION);

		await expect(getAvailableBookingsForCurrentCaregiver()).resolves.toEqual([]);
		await expect(getAcceptedBookingsForCurrentCaregiver()).resolves.toEqual([]);

		expect(mocks.findBookings).not.toHaveBeenCalled();
		expect(consoleWarn).toHaveBeenCalledTimes(2);
	});

	it('returns an empty list when the current user has no caregiver role', async () => {
		const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		mocks.hasRole.mockResolvedValue(false);

		await expect(getAvailableBookingsForCurrentCaregiver()).resolves.toEqual([]);
		expect(mocks.findBookings).not.toHaveBeenCalled();
		expect(consoleWarn).toHaveBeenCalledOnce();
	});

	it('excludes bookings requested by the current caregiver', async () => {
		await getAvailableBookingsForCurrentCaregiver();

		expect(mocks.findBookings).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					requestedByUserId: { not: caregiver.userId },
				}),
			}),
		);
	});

	it('marks a booking that conflicts with the caregiver schedule', async () => {
		mocks.bookingIntervalsOverlap.mockReturnValue(true);

		await expect(getAvailableBookingsForCurrentCaregiver()).resolves.toEqual([
			{ ...booking, hasCaregiverConflict: true },
		]);
		expect(mocks.bookingIntervalsOverlap).toHaveBeenCalledWith(booking, booking);
	});

	it('requires the caregiver role before accepting a booking', async () => {
		mocks.requireRole.mockRejectedValue(new Error('Forbidden'));

		await expect(acceptBookingForCurrentCaregiver(booking.id)).rejects.toThrow('Forbidden');
		expect(mocks.transaction).not.toHaveBeenCalled();
		expect(mocks.requireRole).toHaveBeenCalledWith(UserRole.CAREGIVER);
	});

	it('checks caregiver role and verification in the statement that accepts a booking', async () => {
		await acceptBookingForCurrentCaregiver(booking.id);

		const [
			,
			assignedCaregiverId,
			bookingId,
			requesterExclusionUserId,
			verifiedCaregiverId,
			caregiverRoleUserId,
		] = mocks.executeRaw.mock.calls[0];
		expect(assignedCaregiverId).toBe(caregiver.userId);
		expect(bookingId).toBe(booking.id);
		expect(requesterExclusionUserId).toBe(caregiver.userId);
		expect(verifiedCaregiverId).toBe(caregiver.userId);
		expect(caregiverRoleUserId).toBe(caregiver.userId);
	});

	it('creates a trip and its initial event in the acceptance transaction', async () => {
		await expect(acceptBookingForCurrentCaregiver(booking.id)).resolves.toBe(trip);
		expect(mocks.createTrip).toHaveBeenCalledWith({
			data: {
				bookingId: booking.id,
				caregiverUserId: caregiver.userId,
				childId: booking.childId,
				pickupPin,
			},
			select: { id: true },
		});
		expect(mocks.createTripEvent).toHaveBeenCalledWith({
			data: {
				tripId: trip.id,
				type: TRIP_EVENT_TYPES.statusChanged,
				toStatus: TripStatus.SCHEDULED,
				actorUserId: caregiver.userId,
				occurredAt: expect.any(Date),
				idempotencyKey: `trip-created:${trip.id}`,
			},
		});
	});

	it('diagnoses a verification change after an atomic update matches nothing', async () => {
		mocks.getCaregiverStatus
			.mockResolvedValueOnce(CaregiverStatus.VERIFIED)
			.mockResolvedValueOnce(CaregiverStatus.PENDING_VERIFICATION);
		mocks.executeRaw.mockResolvedValue(0);

		await expect(acceptBookingForCurrentCaregiver(booking.id)).rejects.toThrow(
			CAREGIVER_ERRORS.notVerified,
		);
	});

	it('maps a child exclusion violation to a child conflict', async () => {
		mocks.executeRaw.mockRejectedValue(childConstraintError);

		await expect(acceptBookingForCurrentCaregiver(booking.id)).rejects.toThrow(
			CAREGIVER_ERRORS.childConflict,
		);
	});
});
