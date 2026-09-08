import { describe, expect, it } from 'vitest';
import { bookingIntervalsOverlap } from './overlap';

const firstBooking = {
	scheduledPickupAt: new Date('2026-09-15T20:00:00.000Z'),
	estimatedDurationMin: 60,
};

describe('bookingIntervalsOverlap', () => {
	it('distinguishes an overlap from adjacent bookings', () => {
		const overlappingBooking = {
			scheduledPickupAt: new Date('2026-09-15T20:30:00.000Z'),
			estimatedDurationMin: 60,
		};
		const adjacentBooking = {
			scheduledPickupAt: new Date('2026-09-15T21:00:00.000Z'),
			estimatedDurationMin: 60,
		};

		expect(bookingIntervalsOverlap(firstBooking, overlappingBooking)).toBe(true);
		expect(bookingIntervalsOverlap(firstBooking, adjacentBooking)).toBe(false);
	});
});
