export const bookingFormText = {
	title: 'Schedule a ride',
	description: 'Choose the route and pickup time for this booking.',
	cancel: 'Cancel',
	submit: 'Create booking',
	submitting: 'Creating…',
	optional: '(optional)',
	validationError: 'Please correct the highlighted fields.',
	saveError: 'Unable to save the booking. Please try again.',
	childNotBookableError: 'You no longer have permission to book for this child.',
	pickupInPastError: 'Pickup time must be in the future.',
	overlappingBookingError: 'This child already has an accepted booking at that time.',
	fields: {
		childId: {
			label: 'Child',
			placeholder: 'Select a child',
			required: 'Select a child',
			invalid: 'Select a valid child',
		},
		pickupLocationId: {
			label: 'Pickup location',
			placeholder: 'Select a pickup location',
			required: 'Select a pickup location',
			invalid: 'Select a valid pickup location',
		},
		activityLocationId: {
			label: 'Activity stop',
			placeholder: 'No activity stop',
			invalid: 'Select a valid activity location',
		},
		dropoffLocationId: {
			label: 'Drop-off location',
			placeholder: 'Select a drop-off location',
			required: 'Select a drop-off location',
			invalid: 'Select a valid drop-off location',
		},
		date: {
			label: 'Pickup date',
			invalid: 'Select a valid pickup date',
			past: 'Pickup date cannot be in the past',
			tooFar: 'Pickup date must be within the next 30 days',
		},
		time: {
			label: 'Pickup time',
			invalid: 'Enter a valid pickup time',
		},
		estimatedDurationMin: {
			label: 'Estimated duration (minutes)',
			invalid: 'Duration must be a whole number between 15 and 480 minutes',
		},
		notes: {
			label: 'Notes',
			placeholder: 'Pickup details, access instructions, or anything the caregiver should know',
			tooLong: 'Notes must be 500 characters or fewer',
		},
	},
} as const;
