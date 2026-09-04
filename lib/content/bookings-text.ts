import { BookingStatus } from '@/generated/prisma/enums';

export const bookingsText = {
	title: 'Bookings',
	description: 'Plan rides and keep track of every pickup.',
	newBooking: 'New booking',
	bookingCount: (count: number) => `${count} ${count === 1 ? 'booking' : 'bookings'}`,
	empty: {
		title: 'No bookings yet',
		description: 'Schedule the first ride for your family.',
		cta: 'Schedule a ride',
	},
	status: {
		[BookingStatus.PENDING]: 'Pending',
		[BookingStatus.ACCEPTED]: 'Accepted',
		[BookingStatus.DECLINED]: 'Declined',
		[BookingStatus.CANCELLED]: 'Cancelled',
		[BookingStatus.EXPIRED]: 'Expired',
	},
	details: {
		child: 'Child',
		pickup: 'Pickup',
		activity: 'Activity stop',
		dropoff: 'Drop-off',
		duration: 'Estimated duration',
		caregiver: 'Caregiver',
		notes: 'Notes',
		unassigned: 'Not assigned yet',
		minutes: (count: number) => `${count} min`,
	},
	cancel: {
		trigger: 'Cancel booking',
		confirm: 'Cancel this booking?',
		description: 'This pending booking will no longer be available to caregivers.',
		cancel: 'Keep booking',
		delete: 'Cancel booking',
		deleting: 'Cancelling…',
	},
	error: {
		title: 'Booking could not be loaded',
		description: 'The problem may be temporary. Try loading the booking again.',
		retry: 'Try again',
	},
} as const;
