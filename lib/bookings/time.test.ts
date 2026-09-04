import { describe, expect, it } from 'vitest';
import { BOOKING_EXPIRY_LEAD_TIME_HOURS, getBookingExpiresAt } from '@/lib/bookings/time';

describe('booking expiry', () => {
	it('expires a booking two hours before its scheduled pickup', () => {
		const scheduledPickupAtFixture = new Date('2026-09-15T20:30:00.000Z');

		expect(BOOKING_EXPIRY_LEAD_TIME_HOURS).toBe(2);
		expect(getBookingExpiresAt(scheduledPickupAtFixture)).toEqual(
			new Date('2026-09-15T18:30:00.000Z'),
		);
	});
});
