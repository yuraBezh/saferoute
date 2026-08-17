export const locationFormText = {
	fields: {
		type: {
			invalid: 'Select a valid location type',
		},
		name: {
			invalid: 'Enter a valid location name',
			required: 'Location name is required',
		},
		addressLine1: {
			invalid: 'Enter a valid street address',
			required: 'Street address is required',
		},
		city: {
			invalid: 'Enter a valid city',
			required: 'City is required',
		},
		state: {
			invalid: 'Select a valid state',
		},
		postalCode: {
			invalid: 'Enter a valid ZIP code',
			required: 'ZIP code is required',
		},
	},
} as const;
