import { MS_PER_HOUR } from '@/lib/date';

export const BOOKING_EXPIRY_LEAD_TIME_HOURS = 2;

export const getBookingExpiresAt = (scheduledPickupAt: Date) =>
	new Date(scheduledPickupAt.getTime() - BOOKING_EXPIRY_LEAD_TIME_HOURS * MS_PER_HOUR);
