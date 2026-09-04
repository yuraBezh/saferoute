import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingInput } from '@/lib/validation/booking';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	findChild: vi.fn(),
	findLocations: vi.fn(),
	queryRaw: vi.fn(),
	createBooking: vi.fn(),
	updateBookings: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
	prisma: {
		child: { findFirst: mocks.findChild },
		location: { findMany: mocks.findLocations },
		booking: { create: mocks.createBooking, updateMany: mocks.updateBookings },
		$queryRaw: mocks.queryRaw,
	},
}));

import {
	cancelBookingForCurrentUser,
	createBookingForCurrentUser,
	hasOverlappingAcceptedBooking,
} from './bookings';

const user = { id: 'parent-1' };
const pickup = { id: 'pickup-1', timezone: 'America/Chicago' };
const dropoff = { id: 'dropoff-1', timezone: 'America/New_York' };
const booking = { id: 'booking-1' };
const input: BookingInput = {
	childId: 'child-1',
	pickupLocationId: pickup.id,
	dropoffLocationId: dropoff.id,
	activityLocationId: undefined,
	date: '2026-09-05',
	time: '10:00',
	estimatedDurationMin: 60,
	notes: undefined,
};
const timing = {
	now: new Date('2026-09-05T14:00:00Z'),
	pickup: new Date('2026-09-05T15:00:00Z'),
	expiry: new Date('2026-09-05T13:00:00Z'),
};

describe('booking mutations', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(timing.now);
		mocks.getCurrentUserId.mockResolvedValue(user.id);
		mocks.findChild.mockResolvedValue({ id: input.childId });
		mocks.findLocations.mockResolvedValue([pickup, dropoff]);
		mocks.queryRaw.mockResolvedValue([]);
		mocks.createBooking.mockResolvedValue(booking);
	});

	afterEach(() => vi.useRealTimers());

	it('uses the pickup timezone and expiry policy, leaving optional fields null', async () => {
		await expect(createBookingForCurrentUser(input)).resolves.toBe(booking);
		expect(mocks.createBooking).toHaveBeenCalledWith({
			data: {
				childId: input.childId,
				requestedByUserId: user.id,
				pickupLocationId: pickup.id,
				dropoffLocationId: dropoff.id,
				activityLocationId: null,
				scheduledPickupAt: timing.pickup,
				estimatedDurationMin: input.estimatedDurationMin,
				notes: null,
				expiresAt: timing.expiry,
			},
		});
	});

	it('stops before accessing locations when the child is not bookable', async () => {
		mocks.findChild.mockResolvedValue(null);
		await expect(createBookingForCurrentUser(input)).rejects.toThrow();
		expect(mocks.findLocations).not.toHaveBeenCalled();
		expect(mocks.createBooking).not.toHaveBeenCalled();
	});

	it('rejects an inaccessible activity location before checking conflicts', async () => {
		const activity = { id: 'inaccessible-activity' };
		await expect(
			createBookingForCurrentUser({ ...input, activityLocationId: activity.id }),
		).rejects.toThrow();
		expect(mocks.queryRaw).not.toHaveBeenCalled();
		expect(mocks.createBooking).not.toHaveBeenCalled();
	});

	it('allows the same accessible location for multiple stops', async () => {
		mocks.findLocations.mockResolvedValue([pickup]);
		await expect(
			createBookingForCurrentUser({
				...input,
				dropoffLocationId: pickup.id,
				activityLocationId: pickup.id,
			}),
		).resolves.toBe(booking);
	});

	it('rejects the booking explicitly when the pickup location is absent', async () => {
		mocks.findLocations.mockResolvedValue([
			{ id: 'other-1', timezone: pickup.timezone },
			{ id: 'other-2', timezone: dropoff.timezone },
		]);

		await expect(createBookingForCurrentUser(input)).rejects.toThrow();
		expect(mocks.queryRaw).not.toHaveBeenCalled();
		expect(mocks.createBooking).not.toHaveBeenCalled();
	});

	it.each([0, 1])('rejects pickup at or before now (offset %i ms)', async (offset) => {
		vi.setSystemTime(new Date(timing.pickup.getTime() + offset));
		await expect(createBookingForCurrentUser(input)).rejects.toThrow();
		expect(mocks.queryRaw).not.toHaveBeenCalled();
		expect(mocks.createBooking).not.toHaveBeenCalled();
	});

	it('does not create a booking when an accepted booking overlaps', async () => {
		mocks.queryRaw.mockResolvedValue([booking]);
		await expect(createBookingForCurrentUser(input)).rejects.toThrow();
		expect(mocks.createBooking).not.toHaveBeenCalled();
	});

	it('passes typed nulls when no booking is excluded from the overlap check', async () => {
		await hasOverlappingAcceptedBooking(input.childId, timing.pickup, input.estimatedDurationMin);

		const [, childId, firstExcludedId, secondExcludedId] = mocks.queryRaw.mock.calls[0];
		expect(childId).toBe(input.childId);
		expect(firstExcludedId).toBeNull();
		expect(secondExcludedId).toBeNull();
	});

	it('passes the same booking id to both exclusion predicates', async () => {
		await hasOverlappingAcceptedBooking(
			input.childId,
			timing.pickup,
			input.estimatedDurationMin,
			booking.id,
		);

		const [, , firstExcludedId, secondExcludedId] = mocks.queryRaw.mock.calls[0];
		expect(firstExcludedId).toBe(booking.id);
		expect(secondExcludedId).toBe(booking.id);
	});

	it('reports cancellation failure when the atomic update matches nothing', async () => {
		mocks.updateBookings.mockResolvedValue({ count: 0 });
		await expect(cancelBookingForCurrentUser(booking.id)).rejects.toThrow();
	});

	it('completes cancellation when the atomic update succeeds', async () => {
		mocks.updateBookings.mockResolvedValue({ count: 1 });
		await expect(cancelBookingForCurrentUser(booking.id)).resolves.toBeUndefined();
	});
});
