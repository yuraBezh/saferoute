export const BOOKING_DATA_ERRORS = {
	childNotBookable: 'Child not found or booking not allowed',
	locationUnavailable: 'Location not found or access denied',
	pickupLocationUnavailable: 'Pickup location not found or access denied',
	pickupInPast: 'Pickup time is in the past',
	overlappingBooking: 'This child already has an accepted booking at that time',
	cannotCancel: 'Booking cannot be cancelled',
} as const;
