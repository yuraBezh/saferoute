export const bookingFormText = {
	fields: {
		childId: {
			required: 'Select a child',
			invalid: 'Select a valid child',
		},
		pickupLocationId: {
			required: 'Select a pickup location',
			invalid: 'Select a valid pickup location',
		},
		activityLocationId: {
			invalid: 'Select a valid activity location',
		},
		dropoffLocationId: {
			required: 'Select a drop-off location',
			invalid: 'Select a valid drop-off location',
		},
		date: {
			invalid: 'Select a valid pickup date',
			past: 'Pickup date cannot be in the past',
			tooFar: 'Pickup date must be within the next 30 days',
		},
		time: {
			invalid: 'Enter a valid pickup time',
		},
		estimatedDurationMin: {
			invalid: 'Duration must be a whole number between 15 and 480 minutes',
		},
		notes: {
			tooLong: 'Notes must be 500 characters or fewer',
		},
	},
} as const;
