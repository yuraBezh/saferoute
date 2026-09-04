import { describe, expect, it } from 'vitest';
import { createBookingSchema } from '@/lib/validation/booking';
import { bookingFormText } from '@/lib/content/booking-form-text';

const pickupLocationToday = '2026-09-04';
const bookingSchema = createBookingSchema(pickupLocationToday);

const validBooking = () => ({
	childId: 'child-1',
	pickupLocationId: 'pickup-1',
	activityLocationId: '',
	dropoffLocationId: 'dropoff-1',
	date: pickupLocationToday,
	time: '15:30',
	estimatedDurationMin: 60,
	notes: '',
});

describe('bookingSchema', () => {
	it.each([
		['today', pickupLocationToday],
		['30 days from today', '2026-10-04'],
	] as const)('accepts a booking date for %s', (_case, date) => {
		const booking = { ...validBooking(), date };

		expect(bookingSchema.safeParse(booking).success).toBe(true);
	});

	it.each([
		['yesterday', '2026-09-03', bookingFormText.fields.date.past],
		['31 days from today', '2026-10-05', bookingFormText.fields.date.tooFar],
	] as const)('rejects a booking date for %s', (_case, date, message) => {
		const booking = { ...validBooking(), date };
		const result = bookingSchema.safeParse(booking);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.date).toContain(message);
		}
	});

	it.each(['2026/09/04', '2026-02-31'])('rejects an invalid date: %s', (date) => {
		const booking = { ...validBooking(), date };

		expect(bookingSchema.safeParse(booking).success).toBe(false);
	});

	it.each(['9:00', '24:00', '12:60'])('rejects an invalid time: %s', (time) => {
		const booking = { ...validBooking(), time };
		const result = bookingSchema.safeParse(booking);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.time).toContain(
				bookingFormText.fields.time.invalid,
			);
		}
	});

	it.each([14, 481, 15.5])('rejects an invalid duration: %s', (estimatedDurationMin) => {
		const booking = { ...validBooking(), estimatedDurationMin };

		expect(bookingSchema.safeParse(booking).success).toBe(false);
	});

	it.each([15, 480])('accepts a duration boundary: %s', (estimatedDurationMin) => {
		const booking = { ...validBooking(), estimatedDurationMin };

		expect(bookingSchema.safeParse(booking).success).toBe(true);
	});

	it('coerces a form duration string to a number', () => {
		const booking = { ...validBooking(), estimatedDurationMin: '60' };
		const result = bookingSchema.safeParse(booking);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.estimatedDurationMin).toBe(60);
		}
	});

	it('normalizes empty optional fields to undefined', () => {
		const result = bookingSchema.safeParse(validBooking());

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.activityLocationId).toBeUndefined();
			expect(result.data.notes).toBeUndefined();
		}
	});

	it('accepts a missing activity location and notes', () => {
		const booking: Partial<ReturnType<typeof validBooking>> = validBooking();
		delete booking.activityLocationId;
		delete booking.notes;

		expect(bookingSchema.safeParse(booking).success).toBe(true);
	});

	it('rejects notes longer than 500 characters', () => {
		const booking = { ...validBooking(), notes: 'n'.repeat(501) };
		const result = bookingSchema.safeParse(booking);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.notes).toContain(
				bookingFormText.fields.notes.tooLong,
			);
		}
	});

	it.each(['childId', 'pickupLocationId', 'dropoffLocationId'] as const)(
		'rejects an empty %s',
		(field) => {
			const booking = { ...validBooking(), [field]: '   ' };

			expect(bookingSchema.safeParse(booking).success).toBe(false);
		},
	);

	it.each(['childId', 'pickupLocationId', 'activityLocationId', 'dropoffLocationId'] as const)(
		'rejects an oversized %s',
		(field) => {
			const booking = { ...validBooking(), [field]: 'x'.repeat(31) };

			expect(bookingSchema.safeParse(booking).success).toBe(false);
		},
	);
});
