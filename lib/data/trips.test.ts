import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripStatus } from '@/generated/prisma/enums';
import { TRIP_ERRORS } from '@/lib/trips/errors';
import { TRIP_EVENT_TYPES } from '@/lib/trips/event-types';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	findFirst: vi.fn(),
	updateMany: vi.fn(),
	createEvent: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/prisma', () => ({
	prisma: {
		trip: { findFirst: mocks.findFirst },
		$transaction: mocks.transaction,
	},
}));

import { confirmPickupWithPin, getTripForCaregiver, transitionTrip } from './trips';

const userId = 'caregiver-1';
const tripId = 'trip-1';
const idempotencyKey = 'action-key';
const pickupPin = '123456';
const tx = {
	trip: { findFirst: mocks.findFirst, updateMany: mocks.updateMany },
	tripEvent: { create: mocks.createEvent },
};

const trip = (status: TripStatus, version = 2) => ({
	id: tripId,
	status,
	version,
	pickupPin,
	booking: { activityLocationId: null },
});

describe('trip data', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(userId);
		mocks.transaction.mockImplementation((operation) => operation(tx));
		mocks.updateMany.mockResolvedValue({ count: 1 });
		mocks.createEvent.mockResolvedValue(undefined);
	});

	it('loads a trip assigned to the current caregiver', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.SCHEDULED));

		await expect(getTripForCaregiver(tripId)).resolves.toEqual(trip(TripStatus.SCHEDULED));
		expect(mocks.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: tripId, caregiverUserId: userId } }),
		);
	});

	it.each([
		[TripStatus.SCHEDULED, TripStatus.EN_ROUTE_TO_SCHOOL, 'startedAt'],
		[TripStatus.EN_ROUTE_HOME, TripStatus.COMPLETED, 'completedAt'],
		[TripStatus.SCHEDULED, TripStatus.CANCELLED, 'cancelledAt'],
		[TripStatus.CHILD_PICKED_UP, TripStatus.EN_ROUTE_HOME, null],
	] as const)('transitions %s to %s with the expected timestamp', async (from, to, timestamp) => {
		mocks.findFirst.mockResolvedValue(trip(from));

		await transitionTrip({ tripId, to, actor: 'CAREGIVER', idempotencyKey });

		const update = mocks.updateMany.mock.calls[0][0];
		expect(update.where).toEqual({ id: tripId, status: from, version: 2 });
		expect(update.data).toEqual(
			timestamp
				? expect.objectContaining({ status: to, [timestamp]: expect.any(Date) })
				: { status: to, version: { increment: 1 } },
		);
		expect(mocks.createEvent).toHaveBeenCalledWith({
			data: expect.objectContaining({
				tripId,
				type: TRIP_EVENT_TYPES.statusChanged,
				fromStatus: from,
				toStatus: to,
				actorUserId: userId,
				idempotencyKey,
			}),
		});
	});

	it('scopes guardian transitions through the child guardians relation', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.SCHEDULED));

		await transitionTrip({
			tripId,
			to: TripStatus.CANCELLED,
			actor: 'GUARDIAN',
			idempotencyKey,
		});

		expect(mocks.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: tripId, child: { guardians: { some: { userId } } } },
			}),
		);
	});

	it('rejects a missing trip', async () => {
		mocks.findFirst.mockResolvedValue(null);

		await expect(
			transitionTrip({
				tripId,
				to: TripStatus.EN_ROUTE_TO_SCHOOL,
				actor: 'CAREGIVER',
				idempotencyKey,
			}),
		).rejects.toThrow(TRIP_ERRORS.notFound);
	});

	it('rejects an unavailable transition', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.SCHEDULED));

		await expect(
			transitionTrip({ tripId, to: TripStatus.COMPLETED, actor: 'CAREGIVER', idempotencyKey }),
		).rejects.toThrow(TRIP_ERRORS.invalidTransition);
	});

	it('rejects a concurrent transition', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.SCHEDULED));
		mocks.updateMany.mockResolvedValue({ count: 0 });

		await expect(
			transitionTrip({
				tripId,
				to: TripStatus.EN_ROUTE_TO_SCHOOL,
				actor: 'CAREGIVER',
				idempotencyKey,
			}),
		).rejects.toThrow(TRIP_ERRORS.versionConflict);
	});

	it('treats a repeated idempotency key as an already completed action', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.SCHEDULED));
		mocks.createEvent.mockRejectedValue({ code: 'P2002', meta: { target: ['idempotencyKey'] } });

		await expect(
			transitionTrip({
				tripId,
				to: TripStatus.EN_ROUTE_TO_SCHOOL,
				actor: 'CAREGIVER',
				idempotencyKey,
			}),
		).resolves.toBeUndefined();
	});

	it('confirms pickup and records the handoff event', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.EN_ROUTE_TO_SCHOOL));

		await confirmPickupWithPin({ tripId, pin: pickupPin, idempotencyKey });

		expect(mocks.updateMany).toHaveBeenCalledWith({
			where: { id: tripId, status: TripStatus.EN_ROUTE_TO_SCHOOL, version: 2 },
			data: { status: TripStatus.CHILD_PICKED_UP, version: { increment: 1 } },
		});
		expect(mocks.createEvent).toHaveBeenCalledWith({
			data: expect.objectContaining({
				type: TRIP_EVENT_TYPES.handoffConfirmed,
				fromStatus: TripStatus.EN_ROUTE_TO_SCHOOL,
				toStatus: TripStatus.CHILD_PICKED_UP,
			}),
		});
	});

	it('rejects pickup when the trip is missing', async () => {
		mocks.findFirst.mockResolvedValue(null);

		await expect(confirmPickupWithPin({ tripId, pin: pickupPin, idempotencyKey })).rejects.toThrow(
			TRIP_ERRORS.notFound,
		);
	});

	it('rejects an incorrect pickup PIN', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.EN_ROUTE_TO_SCHOOL));

		await expect(confirmPickupWithPin({ tripId, pin: '000000', idempotencyKey })).rejects.toThrow(
			TRIP_ERRORS.invalidPin,
		);
	});

	it('rejects a concurrent pickup confirmation', async () => {
		mocks.findFirst.mockResolvedValue(trip(TripStatus.EN_ROUTE_TO_SCHOOL));
		mocks.updateMany.mockResolvedValue({ count: 0 });

		await expect(confirmPickupWithPin({ tripId, pin: pickupPin, idempotencyKey })).rejects.toThrow(
			TRIP_ERRORS.versionConflict,
		);
	});
});
