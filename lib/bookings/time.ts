export const BOOKING_EXPIRY_LEAD_TIME_HOURS = 2;

const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;

export const getBookingExpiresAt = (scheduledPickupAt: Date) =>
	new Date(scheduledPickupAt.getTime() - BOOKING_EXPIRY_LEAD_TIME_HOURS * MILLISECONDS_PER_HOUR);
