export const childDetailsText = {
	actions: {
		edit: 'Edit',
		delete: 'Delete',
	},
	details: {
		dateOfBirth: 'Date of birth',
		added: 'Added',
	},
	error: {
		title: 'Something went wrong',
		retry: 'Try again',
	},
	guardians: {
		title: 'Guardians',
		empty: 'No guardians added yet.',
		primary: 'Primary',
		canBook: 'Can book',
		viewOnly: 'View only',
		details: (relationship: string, email: string) =>
			`${relationship} · ${email}`,
		relationships: {
			MOTHER: 'Mother',
			FATHER: 'Father',
			GUARDIAN: 'Guardian',
			OTHER: 'Other',
		},
	},
} as const;
