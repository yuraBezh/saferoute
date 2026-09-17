import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripStatus } from '@/generated/prisma/enums';
import { tripText } from '@/lib/content/trip-text';
import { TRIP_ERRORS } from '@/lib/trips/errors';

const mocks = vi.hoisted(() => ({
	transitionTrip: vi.fn(),
	confirmPickupWithPin: vi.fn(),
	revalidatePath: vi.fn(),
}));

vi.mock('@/lib/data/trips', () => ({
	transitionTrip: mocks.transitionTrip,
	confirmPickupWithPin: mocks.confirmPickupWithPin,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import { confirmPickupAction, transitionTripAction, type TripActionState } from './actions';

const tripId = 'trip-1';
const initialState: TripActionState = { message: '' };
const idempotencyKey = 'action-key';

const createFormData = (values: Record<string, string>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(values)) formData.set(key, value);
	return formData;
};

describe('trip actions', () => {
	beforeEach(() => vi.clearAllMocks());

	it('requires an idempotency key before changing the trip', async () => {
		const result = await transitionTripAction(
			tripId,
			TripStatus.EN_ROUTE_TO_SCHOOL,
			'CAREGIVER',
			initialState,
			new FormData(),
		);

		expect(result).toEqual({ message: tripText.missingKeyError });
		expect(mocks.transitionTrip).not.toHaveBeenCalled();
	});

	it('forwards one action key and revalidates the trip after a transition', async () => {
		const result = await transitionTripAction(
			tripId,
			TripStatus.EN_ROUTE_TO_SCHOOL,
			'CAREGIVER',
			initialState,
			createFormData({ idempotencyKey }),
		);

		expect(mocks.transitionTrip).toHaveBeenCalledWith({
			tripId,
			to: TripStatus.EN_ROUTE_TO_SCHOOL,
			actor: 'CAREGIVER',
			idempotencyKey,
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith(`/trips/${tripId}`);
		expect(result).toEqual({ message: '' });
	});

	it.each([
		[TRIP_ERRORS.notFound, tripText.notFoundError],
		[TRIP_ERRORS.invalidTransition, tripText.invalidTransitionError],
		[TRIP_ERRORS.versionConflict, tripText.versionConflictError],
	])('maps the %s transition error to its user-facing message', async (error, message) => {
		mocks.transitionTrip.mockRejectedValueOnce(new Error(error));

		const result = await transitionTripAction(
			tripId,
			TripStatus.EN_ROUTE_TO_SCHOOL,
			'CAREGIVER',
			initialState,
			createFormData({ idempotencyKey }),
		);

		expect(result).toEqual({ message });
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
	});

	it('returns malformed PIN errors on the PIN field', async () => {
		const result = await confirmPickupAction(
			tripId,
			initialState,
			createFormData({ idempotencyKey, pin: '123' }),
		);

		expect(result).toEqual({
			message: tripText.invalidPinError,
			errors: { pin: [tripText.invalidPinError] },
		});
		expect(mocks.confirmPickupWithPin).not.toHaveBeenCalled();
	});

	it('returns a valid but incorrect PIN error on the PIN field', async () => {
		mocks.confirmPickupWithPin.mockRejectedValueOnce(new Error(TRIP_ERRORS.invalidPin));

		const result = await confirmPickupAction(
			tripId,
			initialState,
			createFormData({ idempotencyKey, pin: '123456' }),
		);

		expect(result).toEqual({
			message: tripText.invalidPinError,
			errors: { pin: [tripText.invalidPinError] },
		});
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
	});

	it('confirms pickup with the submitted PIN and action key', async () => {
		const pin = '123456';
		const result = await confirmPickupAction(
			tripId,
			initialState,
			createFormData({ idempotencyKey, pin }),
		);

		expect(mocks.confirmPickupWithPin).toHaveBeenCalledWith({ tripId, pin, idempotencyKey });
		expect(mocks.revalidatePath).toHaveBeenCalledWith(`/trips/${tripId}`);
		expect(result).toEqual({ message: '' });
	});
});
