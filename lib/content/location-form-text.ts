export const locationFormText = {
	cancel: 'Cancel',
	optional: 'Optional',
	validationError: 'Please fix the highlighted fields.',
	fields: {
		type: {
			label: 'Type',
			placeholder: 'Select a location type',
			invalid: 'Select a valid location type',
			options: {
				home: 'Home',
				school: 'School',
				activity: 'Activity',
			},
		},
		name: {
			label: 'Name',
			invalid: 'Enter a valid location name',
			required: 'Location name is required',
		},
		addressLine1: {
			label: 'Address line 1',
			invalid: 'Enter a valid street address',
			required: 'Street address is required',
		},
		addressLine2: {
			label: 'Address line 2',
		},
		city: {
			label: 'City',
			invalid: 'Enter a valid city',
			required: 'City is required',
		},
		state: {
			label: 'State',
			placeholder: 'Select a state',
			invalid: 'Select a valid state',
		},
		postalCode: {
			label: 'ZIP code',
			invalid: 'Enter a valid ZIP code',
			required: 'ZIP code is required',
		},
	},
} as const;

export const createLocationFormText = {
	title: 'Add a location',
	description: 'Enter the location details below.',
	submit: 'Create location',
	saveError: 'Unable to save the location. Please try again.',
} as const;

export const editLocationFormText = {
	notFoundError: 'This location no longer exists or cannot be edited.',
	saveError: 'Unable to update the location. Please try again.',
} as const;
