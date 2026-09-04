import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { BOOKING_DATA_ERRORS } from '@/lib/bookings/errors';

const {
	fields,
	saveError,
	validationError,
	childNotBookableError,
	pickupInPastError,
	overlappingBookingError,
} = bookingFormText;
const mocks = vi.hoisted(() => ({
	getAccessibleLocation: vi.fn(),
	createBookingForCurrentUser: vi.fn(),
	cancelBookingForCurrentUser: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/data/bookings', () => ({
	getAccessibleLocation: mocks.getAccessibleLocation,
	createBookingForCurrentUser: mocks.createBookingForCurrentUser,
	cancelBookingForCurrentUser: mocks.cancelBookingForCurrentUser,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import { cancelBookingAction, createBookingAction, type BookingFormState } from './actions';

const initialState: BookingFormState = { message: '', errors: {} };
const pickupLocation = {
	id: 'pickup-1',
	timezone: 'America/Chicago',
};
const booking = { id: 'booking-1' };
const validValues = {
	childId: 'child-1',
	date: '2026-09-05',
	time: '10:30',
	pickupLocationId: pickupLocation.id,
	activityLocationId: '',
	dropoffLocationId: 'dropoff-1',
	estimatedDurationMin: '45',
	notes: '',
};

function createFormData(values: Record<string, string>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(values)) formData.set(key, value);
	return formData;
}

describe('createBookingAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-04T15:00:00Z'));
		mocks.getAccessibleLocation.mockResolvedValue(pickupLocation);
		mocks.createBookingForCurrentUser.mockResolvedValue(booking);
	});

	afterEach(() => vi.useRealTimers());

	it('returns the required pickup error before loading a location', async () => {
		const result = await createBookingAction(
			initialState,
			createFormData({ ...validValues, pickupLocationId: ' ' }),
		);

		expect(result.message).toBe(validationError);
		expect(result.errors?.pickupLocationId?.[0]).toBe(fields.pickupLocationId.required);
		expect(mocks.getAccessibleLocation).not.toHaveBeenCalled();
	});

	it('returns the invalid pickup error for an inaccessible location', async () => {
		mocks.getAccessibleLocation.mockResolvedValue(null);
		const result = await createBookingAction(initialState, createFormData(validValues));

		expect(result.message).toBe(validationError);
		expect(result.errors?.pickupLocationId?.[0]).toBe(fields.pickupLocationId.invalid);
		expect(mocks.createBookingForCurrentUser).not.toHaveBeenCalled();
	});

	it('validates remaining fields after loading the pickup timezone', async () => {
		const result = await createBookingAction(
			initialState,
			createFormData({ ...validValues, date: '2026-09-03' }),
		);

		expect(result.message).toBe(validationError);
		expect(result.errors?.date?.[0]).toBe(fields.date.past);
		expect(mocks.createBookingForCurrentUser).not.toHaveBeenCalled();
	});

	it('creates a parsed booking and redirects to the bookings list', async () => {
		await createBookingAction(
			initialState,
			createFormData({ ...validValues, pickupLocationId: ` ${pickupLocation.id} ` }),
		);

		expect(mocks.getAccessibleLocation).toHaveBeenCalledWith(pickupLocation.id);
		expect(mocks.createBookingForCurrentUser).toHaveBeenCalledWith({
			childId: validValues.childId,
			date: validValues.date,
			time: validValues.time,
			pickupLocationId: pickupLocation.id,
			activityLocationId: undefined,
			dropoffLocationId: validValues.dropoffLocationId,
			estimatedDurationMin: Number(validValues.estimatedDurationMin),
			notes: undefined,
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/bookings');
		expect(mocks.redirect).toHaveBeenCalledWith('/bookings');
	});

	it('returns a general message when the location lookup fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.getAccessibleLocation.mockRejectedValue(new Error('Database unavailable'));

		const result = await createBookingAction(initialState, createFormData(validValues));

		expect(result).toEqual({ message: saveError });
		expect(mocks.redirect).not.toHaveBeenCalled();
		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});

	it.each([
		[BOOKING_DATA_ERRORS.childNotBookable, childNotBookableError],
		[BOOKING_DATA_ERRORS.pickupInPast, pickupInPastError],
		[BOOKING_DATA_ERRORS.overlappingBooking, overlappingBookingError],
	])('returns a useful message for the data error %s', async (dataError, expectedMessage) => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.createBookingForCurrentUser.mockRejectedValue(new Error(dataError));

		const result = await createBookingAction(initialState, createFormData(validValues));

		expect(result).toEqual({ message: expectedMessage });
		expect(mocks.redirect).not.toHaveBeenCalled();
		expect(consoleError).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});

	it('keeps an unknown creation error generic', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.createBookingForCurrentUser.mockRejectedValue(new Error('Database unavailable'));

		const result = await createBookingAction(initialState, createFormData(validValues));

		expect(result).toEqual({ message: saveError });
		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});
});

describe('cancelBookingAction', () => {
	beforeEach(() => vi.clearAllMocks());

	it('cancels and redirects to the bookings list', async () => {
		mocks.cancelBookingForCurrentUser.mockResolvedValue(undefined);

		await cancelBookingAction(booking.id);

		expect(mocks.cancelBookingForCurrentUser).toHaveBeenCalledWith(booking.id);
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/bookings');
		expect(mocks.redirect).toHaveBeenCalledWith('/bookings');
	});

	it('redirects to the booking after a cancellation error', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const error = new Error('Database unavailable');
		const redirectError = new Error('NEXT_REDIRECT');
		mocks.cancelBookingForCurrentUser.mockRejectedValue(error);
		mocks.redirect.mockImplementationOnce(() => {
			throw redirectError;
		});

		await expect(cancelBookingAction(booking.id)).rejects.toBe(redirectError);

		expect(mocks.revalidatePath).toHaveBeenCalledWith(`/bookings/${booking.id}`);
		expect(mocks.redirect).toHaveBeenCalledWith(`/bookings/${booking.id}`);
		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});
});
