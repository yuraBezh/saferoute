export const formatBookingPickup = (instant: Date, timeZone: string) =>
	new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone,
		timeZoneName: 'short',
	}).format(instant);
